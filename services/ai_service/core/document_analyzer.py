from models.loader import llm 
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser


import requests
import io
import pypdf
import docx
import json
import re

def analyze_document_from_url(file_url: str, categories_data: list):
    """
    Orquestra o processo completo de análise de um documento a partir de uma URL.
    1. Baixa o arquivo.
    2. Extrai o texto.
    3. Usa a IA para analisar o texto, gerar os dados estruturados e classificá-lo.
    4. Retorna um dicionário Python com os resultados.
    """
    print(f"[Core] Iniciando análise da URL: {file_url}")
    
    # ... (O código dos Passos 1 e 2 permanece exatamente o mesmo) ...
    # --- Passo 1: Baixar o arquivo da URL ---
    try:
        response = requests.get(file_url)
        response.raise_for_status()  
    except requests.exceptions.RequestException as e:
        print(f"Erro ao baixar o arquivo da URL: {e}")
        raise ValueError(f"Não foi possível baixar o arquivo da URL: {file_url}")

    file_content = io.BytesIO(response.content)
    texto_extraido = ""

    # --- Passo 2: Extrair o texto baseado na extensão do arquivo ---
    main_url_path = file_url.split('?')[0]

    if main_url_path.lower().endswith('.pdf'):
        try:
            reader = pypdf.PdfReader(file_content)
            for page in reader.pages:
                texto_extraido += page.extract_text() or ""
        except Exception as e:
            raise ValueError(f"Falha ao processar o arquivo PDF: {e}")
    
    elif main_url_path.lower().endswith('.docx'):
        try:
            doc = docx.Document(file_content)
            for para in doc.paragraphs:
                texto_extraido += para.text + "\n"
        except Exception as e:
            raise ValueError(f"Falha ao processar o arquivo DOCX: {e}")
    else:
        raise ValueError("Formato de arquivo não suportado. Use PDF ou DOCX.")

    if not texto_extraido.strip():
        raise ValueError("O documento parece estar vazio ou não contém texto extraível.")

    print(f"[Core] Texto extraído com sucesso. Total de caracteres: {len(texto_extraido)}")

    # --- Passo 3: Preparar e invocar a IA (COM PROMPT MELHORADO) ---
    
    category_options_text = ", ".join([
        f"{sub['id']}: {cat['nome']} > {sub['nome']}"
        for cat in categories_data
        for sub in cat.get('subcategorias', [])
    ])

    # ✅ **INÍCIO DA CORREÇÃO NO PROMPT**
    # Adicionamos um exemplo explícito de como a saída deve ser.
    # Isso aumenta drasticamente a confiabilidade do formato da resposta.
    prompt_template = ChatPromptTemplate.from_template(
        """
        Sua tarefa é analisar o texto de um documento e retornar um objeto JSON válido.

        **REGRAS IMPORTANTES:**
        1.  Sua resposta DEVE SER APENAS o objeto JSON.
        2.  NÃO inclua texto introdutório, explicações ou formatação de markdown como ```json.
        3.  O JSON DEVE ser completo e sintaticamente correto.

        **EXEMPLO DE RESPOSTA PERFEITA:**
        <exemplo>
        {{
            "titulo": "Como Resetar a Senha do E-mail",
            "descricao": "Guia para usuários que esqueceram a senha do e-mail corporativo e precisam redefini-la.",
            "solucao": "Para resetar a senha, acesse a página '[intranet.empresa.com/reset](https://intranet.empresa.com/reset)', digite seu CPF e siga as instruções enviadas para o seu telefone cadastrado. O link expira em 10 minutos.",
            "palavras_chave": ["senha", "reset", "email", "esqueci", "redefinir"],
            "subcategoria_id": 12
        }}
        </exemplo>

        Agora, analise o texto do documento abaixo seguindo TODAS as regras e o formato do exemplo.

        **LISTA DE OPÇÕES DE SUBCATEGORIA (ID: Tema > Micro-tema):**
        ---
        {category_options}
        ---

        **TEXTO DO DOCUMENTO PARA ANÁLISE:**
        ---
        {context}
        ---

        **JSON GERADO:**
        """
    )
    # ✅ **FIM DA CORREÇÃO NO PROMPT**
    
    analysis_chain = prompt_template | llm | StrOutputParser()
    
    json_string_response = analysis_chain.invoke({
        "context": texto_extraido,
        "category_options": category_options_text
    })
    
    print(f"[Core] Resposta bruta recebida do LLM: {json_string_response}")

    # --- Passo 4: Limpar, validar e retornar o resultado (O código aqui já está correto) ---
    clean_json_string = None
    try:
        cleaned_response = json_string_response.strip()
        match = re.search(r'\{.*\}', cleaned_response, re.DOTALL)
        if not match:
            raise ValueError("Nenhum objeto JSON foi encontrado na resposta do LLM.")
        clean_json_string = match.group(0)
        parsed_json = json.loads(clean_json_string)
        print("[Core] Resposta da IA processada como JSON com sucesso.")
        return parsed_json
    except json.JSONDecodeError as e:
        print(f"Erro de decodificação JSON: {e}")
        print(f"Texto que falhou na análise: '''{clean_json_string}'''")
        raise ValueError("A resposta do LLM parecia um JSON, mas continha um erro de sintaxe.")
    except ValueError as e:
        print(f"Erro de valor: {e}")
        print(f"Resposta completa do LLM que causou o erro: '''{json_string_response}'''")
        raise ValueError("A resposta da IA não pôde ser processada como um JSON válido.")