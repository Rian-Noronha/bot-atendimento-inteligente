from fastapi import APIRouter, HTTPException
from schemas.document import AnalyzeRequest 
from core.document_analyzer import analyze_document_from_url 

# Cria um roteador específico para este endpoint, mantendo o código organizado
router = APIRouter()

@router.post("/analyze-document", summary="Analisa e categoriza um documento de uma URL")
async def analyze_document_endpoint(request: AnalyzeRequest):
    """
    Este é o ponto de entrada da API que o backend Node.js chama.
    
    1. Recebe a requisição HTTP.
    2. Usa o `AnalyzeRequest` para validar automaticamente se a requisição contém
       uma 'file_url' (string) e 'categories' (lista).
    3. Chama a função `analyze_document_from_url` para executar a lógica principal.
    4. Captura possíveis erros e os retorna como respostas HTTP apropriadas.
    5. Se tudo der certo, retorna o JSON com os dados estruturados.
    """
    try:
        # Log para você ver no terminal que a requisição chegou corretamente
        print(f"[Endpoint] /analyze-document chamado com URL: {request.file_url}")

        # ✅ CORREÇÃO APLICADA AQUI:
        # O nome do argumento foi alterado de 'categories' para 'categories_data'
        # para corresponder exatamente à definição da função em document_analyzer.py.
        structured_data = analyze_document_from_url(
            file_url=request.file_url,
            categories_data=request.categories
        )
        
        # Retorna o resultado para o Node.js
        return structured_data

    except ValueError as ve:
        # Captura erros de validação específicos da nossa lógica (ex: formato de arquivo, documento vazio)
        print(f"Erro de validação no endpoint de análise: {ve}")
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        # Captura quaisquer outros erros inesperados durante o processo
        print(f"Erro inesperado no endpoint de análise: {e}")
        raise HTTPException(status_code=500, detail=f"Ocorreu um erro interno ao processar o documento: {e}")
