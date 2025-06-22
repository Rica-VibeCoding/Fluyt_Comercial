📦 Body: {"nome":"Fluyt São Paulo ","endereco":"Av. Paulista, 1000 - Centro, São Paulo/SP","telefone":"11987654321","email":"centro@fluyt.com.br","empresa_id":""}
api-client.ts:144 🔄 É retry? false
:8000/api/v1/lojas/cb2a7e07-7801-4fa1-ae54-c7175581435e:1 
            
            
           Failed to load resource: the server responded with a status of 500 (Internal Server Error)Understand this error
api-client.ts:151 📥 API Response: 500 Internal Server Error
api-client.ts:152 📍 URL: http://localhost:8000/api/v1/lojas/cb2a7e07-7801-4fa1-ae54-c7175581435e
api-client.ts:153 📊 Status: 500
api-client.ts:154 📝 Status Text: Internal Server Error
api-client.ts:155 🏷️ Headers: Object
hook.js:608 ❌ Resposta não OK: Object
overrideMethod @ hook.js:608Understand this error
api-client.ts:224 ❌ Erro na requisição
hook.js:608 🔥 Erro capturado: Error: Erro ao atualizar loja: {'code': '22P02', 'details': None, 'hint': None, 'message': 'invalid input syntax for type uuid: ""'}
    at ApiClient.request (api-client.ts:210:15)
    at async eval (use-loja-crud.ts:86:24)
    at async handleSubmit (gestao-lojas.tsx:59:17)
overrideMethod @ hook.js:608Understand this error
hook.js:608 📍 URL que falhou: http://localhost:8000/api/v1/lojas/cb2a7e07-7801-4fa1-ae54-c7175581435e
overrideMethod @ hook.js:608Understand this error
hook.js:608 🔧 Tipo do erro: Error
overrideMethod @ hook.js:608Understand this error