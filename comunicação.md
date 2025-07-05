2025-07-05 19:00:11,798 - modules.lojas.controller - INFO - Listagem de lojas: 9 itens (página 1) para usuário 03de5532-db40-4f78-aa66-63d30060ea4e
2025-07-05 19:00:11,799 - main - INFO - RESPONSE: 200 in 0.879s
INFO:     127.0.0.1:50681 - "GET /api/v1/lojas/ HTTP/1.1" 200 OK
2025-07-05 19:01:25,376 - main - INFO - REQUEST: OPTIONS /api/v1/lojas
2025-07-05 19:01:25,376 - main - INFO - REQUEST: OPTIONS /api/v1/lojas
2025-07-05 19:01:25,376 - main - INFO - RESPONSE: 200 in 0.000s
INFO:     127.0.0.1:50796 - "OPTIONS /api/v1/lojas HTTP/1.1" 200 OK
2025-07-05 19:01:25,376 - main - INFO - RESPONSE: 200 in 0.000s
INFO:     127.0.0.1:50797 - "OPTIONS /api/v1/lojas HTTP/1.1" 200 OK
2025-07-05 19:01:25,377 - main - INFO - REQUEST: GET /api/v1/lojas
2025-07-05 19:01:25,378 - main - INFO - RESPONSE: 307 in 0.001s
INFO:     127.0.0.1:50797 - "GET /api/v1/lojas HTTP/1.1" 307 Temporary Redirect
2025-07-05 19:01:25,379 - main - INFO - REQUEST: GET /api/v1/lojas
2025-07-05 19:01:25,379 - main - INFO - RESPONSE: 307 in 0.000s
INFO:     127.0.0.1:50797 - "GET /api/v1/lojas HTTP/1.1" 307 Temporary Redirect
2025-07-05 19:01:25,379 - main - INFO - REQUEST: OPTIONS /api/v1/lojas/
2025-07-05 19:01:25,380 - main - INFO - RESPONSE: 200 in 0.001s
INFO:     127.0.0.1:50796 - "OPTIONS /api/v1/lojas/ HTTP/1.1" 200 OK
2025-07-05 19:01:25,380 - main - INFO - REQUEST: OPTIONS /api/v1/lojas/
2025-07-05 19:01:25,381 - main - INFO - RESPONSE: 200 in 0.001s
INFO:     127.0.0.1:50797 - "OPTIONS /api/v1/lojas/ HTTP/1.1" 200 OK
2025-07-05 19:01:25,381 - main - INFO - REQUEST: GET /api/v1/lojas/
2025-07-05 19:01:25,646 - httpx - INFO - HTTP Request: GET https://momwbpxqnvgehotfmvde.supabase.co/rest/v1/usuarios?select=%2A&user_id=eq.03de5532-db40-4f78-aa66-63d30060ea4e "HTTP/1.1 200 OK"
2025-07-05 19:01:25,914 - httpx - INFO - HTTP Request: GET https://momwbpxqnvgehotfmvde.supabase.co/rest/v1/c_lojas?select=id&ativo=eq.True "HTTP/1.1 200 OK"     
2025-07-05 19:01:26,468 - httpx - INFO - HTTP Request: GET https://momwbpxqnvgehotfmvde.supabase.co/rest/v1/c_lojas?select=%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%2A%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20empresa%3Acad_empresas%21empresa_id%28id%2C%20nome%29%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20gerente%3Acad_equipe%21gerente_id%28id%2C%20nome%29%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20&ativo=eq.True&order=created_at.desc&limit=20&offset=0 "HTTP/1.1 200 OK"
2025-07-05 19:01:26,470 - modules.lojas.controller - INFO - Listagem de lojas: 9 itens (página 1) para usuário 03de5532-db40-4f78-aa66-63d30060ea4e
2025-07-05 19:01:26,471 - main - INFO - RESPONSE: 200 in 1.090s
INFO:     127.0.0.1:50796 - "GET /api/v1/lojas/ HTTP/1.1" 200 OK
2025-07-05 19:01:26,474 - main - INFO - REQUEST: GET /api/v1/lojas/
2025-07-05 19:01:26,681 - httpx - INFO - HTTP Request: GET https://momwbpxqnvgehotfmvde.supabase.co/rest/v1/usuarios?select=%2A&user_id=eq.03de5532-db40-4f78-aa66-63d30060ea4e "HTTP/1.1 200 OK"
2025-07-05 19:01:27,156 - httpx - INFO - HTTP Request: GET https://momwbpxqnvgehotfmvde.supabase.co/rest/v1/c_lojas?select=id&ativo=eq.True "HTTP/1.1 200 OK"     
2025-07-05 19:01:27,685 - httpx - INFO - HTTP Request: GET https://momwbpxqnvgehotfmvde.supabase.co/rest/v1/c_lojas?select=%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%2A%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20empresa%3Acad_empresas%21empresa_id%28id%2C%20nome%29%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20gerente%3Acad_equipe%21gerente_id%28id%2C%20nome%29%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20&ativo=eq.True&order=created_at.desc&limit=20&offset=0 "HTTP/1.1 200 OK"
2025-07-05 19:01:27,686 - modules.lojas.controller - INFO - Listagem de lojas: 9 itens (página 1) para usuário 03de5532-db40-4f78-aa66-63d30060ea4e
2025-07-05 19:01:27,687 - main - INFO - RESPONSE: 200 in 1.213s
INFO:     127.0.0.1:50796 - "GET /api/v1/lojas/ HTTP/1.1" 200 OK