ML 'UNIUQE e SUBLIME.xml' - Cliente: b884a16b-927f-4b2a-a156-544647b942e6 - Usuário: 03de5532-db40-4f78-aa66-63d30060ea4e
2025-06-30 19:35:55,712 - modules.ambientes.xml_importer - INFO - Processando XML 'UNIUQE e SUBLIME.xml' com extrator
2025-06-30 19:35:55,720 - modules.ambientes.extrator_xml.app.extractors.xml_extractor - INFO - Linhas detectadas: ['Unique', 'Sublime']
2025-06-30 19:35:56,345 - httpx - INFO - HTTP Request: POST https://momwbpxqnvgehotfmvde.supabase.co/rest/v1/c_ambientes "HTTP/1.1 201 Created"
2025-06-30 19:35:56,898 - httpx - INFO - HTTP Request: GET https://momwbpxqnvgehotfmvde.supabase.co/rest/v1/c_ambientes_material?select=id&xml_hash=eq.6a2189e39e7274c7158f2ae8e312a2604aa7157a1e56ee363184aea103ead0fd "HTTP/1.1 200 OK"
2025-06-30 19:35:56,899 - main - INFO - RESPONSE: 422 in 1.437s
INFO:     127.0.0.1:59714 - "POST /api/v1/ambientes/importar-xml?cliente_id=b884a16b-927f-4b2a-a156-544647b942e6 HTTP/1.1" 422 Unprocessable Entity     
2025-06-30 19:35:56,903 - main - INFO - REQUEST: GET /api/v1/ambientes      
2025-06-30 19:35:56,903 - main - INFO - RESPONSE: 307 in 0.000s
INFO:     127.0.0.1:59714 - "GET /api/v1/ambientes?clienteId=b884a16b-927f-4b2a-a156-544647b942e6&incluir_materiais=true HTTP/1.1" 307 Temporary Redirect
2025-06-30 19:35:56,915 - main - INFO - REQUEST: GET /api/v1/ambientes/
2025-06-30 19:35:57,112 - httpx - INFO - HTTP Request: GET https://momwbpxqnvgehotfmvde.supabase.co/rest/v1/usuarios?select=%2A&user_id=eq.03de5532-db40-4f78-aa66-63d30060ea4e "HTTP/1.1 200 OK"
2025-06-30 19:35:57,114 - modules.ambientes.controller - INFO - Listando ambientes - Usuário: 03de5532-db40-4f78-aa66-63d30060ea4e
2025-06-30 19:35:57,606 - httpx - INFO - HTTP Request: GET https://momwbpxqnvgehotfmvde.supabase.co/rest/v1/c_ambientes?select=id&cliente_id=eq.b884a16b-927f-4b2a-a156-544647b942e6 "HTTP/1.1 200 OK"
2025-06-30 19:35:58,129 - httpx - INFO - HTTP Request: GET https://momwbpxqnvgehotfmvde.supabase.co/rest/v1/c_ambientes?select=%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%2A%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20cliente%3Ac_clientes%21cliente_id%28id%2C%20nome%29%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20materiais%3Ac_ambientes_material%21ambiente_id%28materiais_json%2C%20xml_hash%29%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20&cliente_id=eq.b884a16b-927f-4b2a-a156-544647b942e6&order=created_at.desc&limit=20&offset=0 "HTTP/1.1 200 OK"
2025-06-30 19:35:58,130 - modules.ambientes.controller - INFO - Ambientes listados com sucesso - Total: 1
2025-06-30 19:35:58,131 - main - INFO - RESPONSE: 200 in 1.216s
INFO:     127.0.0.1:59714 - "GET /api/v1/ambientes/?clienteId=b884a16b-927f-4b2a-a156-544647b942e6&incluir_materiais=true HTTP/1.1" 200 OK
2025-06-30 19:36:02,982 - main - INFO - REQUEST: OPTIONS /api/v1/ambientes/6271b790-8033-4cd1-9b3c-6ed7d4007fa4
2025-06-30 19:36:02,982 - main - INFO - RESPONSE: 200 in 0.000s
INFO:     127.0.0.1:59714 - "OPTIONS /api/v1/ambientes/6271b790-8033-4cd1-9b3c-6ed7d4007fa4?incluir_materiais=true HTTP/1.1" 200 OK
2025-06-30 19:36:02,984 - main - INFO - REQUEST: GET /api/v1/ambientes/6271b790-8033-4cd1-9b3c-6ed7d4007fa4
2025-06-30 19:36:03,601 - httpx - INFO - HTTP Request: GET https://momwbpxqnvgehotfmvde.supabase.co/rest/v1/usuarios?select=%2A&user_id=eq.03de5532-db40-4f78-aa66-63d30060ea4e "HTTP/1.1 200 OK"
2025-06-30 19:36:03,602 - modules.ambientes.controller - INFO - Buscando ambiente 6271b790-8033-4cd1-9b3c-6ed7d4007fa4 - Usuário: 03de5532-db40-4f78-aa66-63d30060ea4e
2025-06-30 19:36:04,220 - httpx - INFO - HTTP Request: GET https://momwbpxqnvgehotfmvde.supabase.co/rest/v1/c_ambientes?select=%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%2A%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20cliente%3Ac_clientes%21cliente_id%28id%2C%20nome%29%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20materiais%3Ac_ambientes_material%21ambiente_id%28materiais_json%2C%20xml_hash%29%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20&id=eq.6271b790-8033-4cd1-9b3c-6ed7d4007fa4 "HTTP/1.1 200 OK"
2025-06-30 19:36:04,222 - modules.ambientes.controller - INFO - Ambiente 6271b790-8033-4cd1-9b3c-6ed7d4007fa4 encontrado com sucesso
2025-06-30 19:36:04,223 - main - INFO - RESPONSE: 200 in 1.239s
INFO:     127.0.0.1:59714 - "GET /api/v1/ambientes/6271b790-8033-4cd1-9b3c-6ed7d4007fa4?incluir_materiais=true HTTP/1.1" 200 OK
2025-06-30 19:36:05,003 - main - INFO - REQUEST: GET /api/v1/ambientes/6271b790-8033-4cd1-9b3c-6ed7d4007fa4
2025-06-30 19:36:05,198 - httpx - INFO - HTTP Request: GET https://momwbpxqnvgehotfmvde.supabase.co/rest/v1/usuarios?select=%2A&user_id=eq.03de5532-db40-4f78-aa66-63d30060ea4e "HTTP/1.1 200 OK"
2025-06-30 19:36:05,200 - modules.ambientes.controller - INFO - Buscando ambiente 6271b790-8033-4cd1-9b3c-6ed7d4007fa4 - Usuário: 03de5532-db40-4f78-aa66-63d30060ea4e
2025-06-30 19:36:05,739 - httpx - INFO - HTTP Request: GET https://momwbpxqnvgehotfmvde.supabase.co/rest/v1/c_ambientes?select=%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%2A%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20cliente%3Ac_clientes%21cliente_id%28id%2C%20nome%29%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20materiais%3Ac_ambientes_material%21ambiente_id%28materiais_json%2C%20xml_hash%29%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20&id=eq.6271b790-8033-4cd1-9b3c-6ed7d4007fa4 "HTTP/1.1 200 OK"
2025-06-30 19:36:05,739 - modules.ambientes.controller - INFO - Ambiente 6271b790-8033-4cd1-9b3c-6ed7d4007fa4 encontrado com sucesso
2025-06-30 19:36:05,740 - main - INFO - RESPONSE: 200 in 0.737s
INFO:     127.0.0.1:59714 - "GET /api/v1/ambientes/6271b790-8033-4cd1-9b3c-6ed7d4007fa4?incluir_materiais=true HTTP/1.1" 200 OK