2025-07-05 19:19:16,821 - main - INFO - REQUEST: GET /api/v1/lojas/
2025-07-05 19:19:17,073 - httpx - INFO - HTTP Request: GET https://momwbpxqnvgehotfmvde.supabase.co/rest/v1/usuarios?select=%2A&user_id=eq.03de5532-db40-4f78-aa66-63d30060ea4e "HTTP/1.1 200 OK"
2025-07-05 19:19:17,316 - httpx - INFO - HTTP Request: GET https://momwbpxqnvgehotfmvde.supabase.co/rest/v1/c_lojas?select=id&ativo=eq.True "HTTP/1.1 200 OK"     
2025-07-05 19:19:17,520 - httpx - INFO - HTTP Request: GET https://momwbpxqnvgehotfmvde.supabase.co/rest/v1/c_lojas?select=%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%2A%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20empresa%3Acad_empresas%21empresa_id%28id%2C%20nome%29%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20gerente%3Acad_equipe%21gerente_id%28id%2C%20nome%29%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20&ativo=eq.True&order=created_at.desc&limit=20&offset=0 "HTTP/1.1 200 OK"
2025-07-05 19:19:17,521 - modules.lojas.controller - INFO - Listagem de lojas: 9 itens (página 1) para usuário 03de5532-db40-4f78-aa66-63d30060ea4e
2025-07-05 19:19:17,522 - main - INFO - RESPONSE: 200 in 0.701s
INFO:     127.0.0.1:52401 - "GET /api/v1/lojas/ HTTP/1.1" 200 OK
2025-07-05 19:19:17,525 - main - INFO - REQUEST: GET /api/v1/lojas/
2025-07-05 19:19:17,727 - httpx - INFO - HTTP Request: GET https://momwbpxqnvgehotfmvde.supabase.co/rest/v1/usuarios?select=%2A&user_id=eq.03de5532-db40-4f78-aa66-63d30060ea4e "HTTP/1.1 200 OK"
2025-07-05 19:19:17,930 - httpx - INFO - HTTP Request: GET https://momwbpxqnvgehotfmvde.supabase.co/rest/v1/c_lojas?select=id&ativo=eq.True "HTTP/1.1 200 OK"     
2025-07-05 19:19:18,134 - httpx - INFO - HTTP Request: GET https://momwbpxqnvgehotfmvde.supabase.co/rest/v1/c_lojas?select=%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%2A%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20empresa%3Acad_empresas%21empresa_id%28id%2C%20nome%29%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20gerente%3Acad_equipe%21gerente_id%28id%2C%20nome%29%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20&ativo=eq.True&order=created_at.desc&limit=20&offset=0 "HTTP/1.1 200 OK"
2025-07-05 19:19:18,135 - modules.lojas.controller - INFO - Listagem de lojas: 9 itens (página 1) para usuário 03de5532-db40-4f78-aa66-63d30060ea4e
2025-07-05 19:19:18,136 - main - INFO - RESPONSE: 200 in 0.613s
INFO:     127.0.0.1:52401 - "GET /api/v1/lojas/ HTTP/1.1" 200 OK


2025-07-05 19:20:12,822 - main - INFO - REQUEST: PUT /api/v1/config-loja/d8eb9a05-2191-46f1-8e37-df1ae698708a
2025-07-05 19:20:13,093 - httpx - INFO - HTTP Request: GET https://momwbpxqnvgehotfmvde.supabase.co/rest/v1/usuarios?select=%2A&user_id=eq.03de5532-db40-4f78-aa66-63d30060ea4e "HTTP/1.1 200 OK"
2025-07-05 19:20:13,299 - httpx - INFO - HTTP Request: GET https://momwbpxqnvgehotfmvde.supabase.co/rest/v1/c_config_loja?select=%2A&id=eq.d8eb9a05-2191-46f1-8e37-df1ae698708a&limit=1 "HTTP/1.1 200 OK"
2025-07-05 19:20:13,500 - httpx - INFO - HTTP Request: GET https://momwbpxqnvgehotfmvde.supabase.co/rest/v1/c_lojas?select=nome&id=eq.317c3115-e071-40a6-9bc5-7c3227e0d82c&limit=1 "HTTP/1.1 200 OK"
2025-07-05 19:20:13,716 - httpx - INFO - HTTP Request: PATCH https://momwbpxqnvgehotfmvde.supabase.co/rest/v1/c_config_loja?id=eq.d8eb9a05-2191-46f1-8e37-df1ae698708a "HTTP/1.1 200 OK"
2025-07-05 19:20:13,928 - httpx - INFO - HTTP Request: GET https://momwbpxqnvgehotfmvde.supabase.co/rest/v1/c_config_loja?select=%2A&id=eq.d8eb9a05-2191-46f1-8e37-df1ae698708a&limit=1 "HTTP/1.1 200 OK"
2025-07-05 19:20:14,127 - httpx - INFO - HTTP Request: GET https://momwbpxqnvgehotfmvde.supabase.co/rest/v1/c_lojas?select=nome&id=eq.317c3115-e071-40a6-9bc5-7c3227e0d82c&limit=1 "HTTP/1.1 200 OK"
2025-07-05 19:20:14,128 - main - INFO - RESPONSE: 200 in 1.306s
INFO:     127.0.0.1:52863 - "PUT /api/v1/config-loja/d8eb9a05-2191-46f1-8e37-df1ae698708a HTTP/1.1" 200 OK