 200 OK"
2025-06-24 01:01:36,043 - modules.empresas.controller - INFO - Listagem de empresas: 10 itens (página 1) para usuário 03de5532-db40-4f78-aa66-63d30060ea4e
2025-06-24 01:01:36,044 - main - INFO - RESPONSE: 200 in 0.625s
INFO:     127.0.0.1:58650 - "GET /api/v1/empresas/ HTTP/1.1"
 200 OK
2025-06-24 01:02:04,227 - main - INFO - REQUEST: POST /api/v1/equipe
2025-06-24 01:02:04,228 - main - INFO - RESPONSE: 307 in 0.001s
INFO:     127.0.0.1:58750 - "POST /api/v1/equipe HTTP/1.1" 307 Temporary Redirect
2025-06-24 01:02:04,231 - main - INFO - REQUEST: POST /api/v1/equipe/
2025-06-24 01:02:04,831 - httpx - INFO - HTTP Request: GET https://momwbpxqnvgehotfmvde.supabase.co/rest/v1/usuarios?select=%2A&user_id=eq.03de5532-db40-4f78-aa66-63d30060ea4e "HTTP/1.1 200 OK"
2025-06-24 01:02:04,832 - modules.equipe.controller - ERROR - 🔍 DEBUG - dados_raw recebidos: {'nome': 'Condomínio Civil Mauá Office Cen', 'email': 'quele.pereira@mauaplaza.com.br', 'telefone': '(11) 94737-2370', 'perfil': 'VENDEDOR', 'nivel_acesso': 'USUARIO', 'loja_id': '1c9311a7-1031-46e6-9db4-c3ff106ca855', 'setor_id': 'b54209a6-50ac-41f6-bf2c-996b6fe0bf2d', 'data_admissao': '2025-06-24', 'salario': 2200}        
2025-06-24 01:02:04,832 - modules.equipe.controller - ERROR - 🔍 DEBUG - tipo dados_raw: <class 'dict'>
2025-06-24 01:02:04,832 - modules.equipe.controller - ERROR - 🔍 DEBUG - keys em dados_raw: ['nome', 'email', 'telefone', 'perfil', 'nivel_acesso', 'loja_id', 'setor_id', 'data_admissao', 'salario']
🔍 CONSOLE DEBUG - dados_raw: {'nome': 'Condomínio Civil Mauá Office Cen', 'email': 'quele.pereira@mauaplaza.com.br', 'telefone': '(11) 94737-2370', 'perfil': 'VENDEDOR', 'nivel_acesso': 'USUARIO', 'loja_id': '1c9311a7-1031-46e6-9db4-c3ff106ca855', 'setor_id': 'b54209a6-50ac-41f6-bf2c-996b6fe0bf2d', 'data_admissao': '2025-06-24', 'salario': 2200}
🔍 CONSOLE DEBUG - keys: ['nome', 'email', 'telefone', 'perfil', 'nivel_acesso', 'loja_id', 'setor_id', 'data_admissao', 'salario']
2025-06-24 01:02:04,832 - modules.equipe.controller - ERROR - 🔍 DEBUG - setor_id encontrado: b54209a6-50ac-41f6-bf2c-996b6fe0bf2d (tipo: <class 'str'>)
🔍 CONSOLE DEBUG - setor_id: b54209a6-50ac-41f6-bf2c-996b6fe0bf2d
2025-06-24 01:02:04,832 - modules.equipe.controller - ERROR - 🔍 DEBUG - setorId camelCase NÃO encontrado!
🔍 CONSOLE DEBUG - setorId camelCase NÃO encontrado!        
🔍 VALIDAR RELACIONAMENTOS - loja_id: 1c9311a7-1031-46e6-9db4-c3ff106ca855, setor_id: b54209a6-50ac-41f6-bf2c-996b6fe0bf2d
2025-06-24 01:02:04,833 - modules.equipe.services - ERROR - 🔍 VALIDAR RELACIONAMENTOS - loja_id: 1c9311a7-1031-46e6-9db4-c3ff106ca855, setor_id: b54209a6-50ac-41f6-bf2c-996b6fe0bf2d
🔍 VALIDANDO LOJA - loja_id_str: 1c9311a7-1031-46e6-9db4-c3ff106ca855
2025-06-24 01:02:04,833 - modules.equipe.services - ERROR - 🔍 VALIDANDO LOJA - loja_id_str: 1c9311a7-1031-46e6-9db4-c3ff106ca855
2025-06-24 01:02:05,096 - httpx - INFO - HTTP Request: GET https://momwbpxqnvgehotfmvde.supabase.co/rest/v1/c_lojas?select=id%2C%20nome&id=eq.1c9311a7-1031-46e6-9db4-c3ff106ca855&ativo=eq.True "HTTP/1.1 200 OK"
🔍 RESULTADO LOJA - result.data: [{'id': '1c9311a7-1031-46e6-9db4-c3ff106ca855', 'nome': 'Teste Loja 231233'}]
2025-06-24 01:02:05,097 - modules.equipe.services - ERROR - 🔍 RESULTADO LOJA - result.data: [{'id': '1c9311a7-1031-46e6-9db4-c3ff106ca855', 'nome': 'Teste Loja 231233'}]
🔍 VALIDANDO SETOR - setor_id_str: b54209a6-50ac-41f6-bf2c-996b6fe0bf2d
2025-06-24 01:02:05,097 - modules.equipe.services - ERROR - 🔍 VALIDANDO SETOR - setor_id_str: b54209a6-50ac-41f6-bf2c-996b6fe0bf2d
✅ SETOR VÁLIDO (BYPASS): Medição
2025-06-24 01:02:05,097 - modules.equipe.services - ERROR - ✅ SETOR VÁLIDO (BYPASS): Medição
✅ VALIDAÇÃO CONCLUÍDA COM SUCESSO
2025-06-24 01:02:05,097 - modules.equipe.services - ERROR - ✅ VALIDAÇÃO CONCLUÍDA COM SUCESSO
2025-06-24 01:02:05,098 - modules.equipe.repository - INFO - Criando funcionário: dados={'nome': 'Condomínio Civil Mauá Office Cen', 'email': 'quele.pereira@mauaplaza.com.br', 'telefone': '11947372370', 'perfil': 'VENDEDOR', 'nivel_acesso': 'USUARIO', 'loja_id': UUID('1c9311a7-1031-46e6-9db4-c3ff106ca855'), 'setor_id': UUID('b54209a6-50ac-41f6-bf2c-996b6fe0bf2d'), 'salario': 2200.0, 'data_admissao': datetime.date(2025, 6, 24)}
2025-06-24 01:02:05,498 - httpx - INFO - HTTP Request: GET https://momwbpxqnvgehotfmvde.supabase.co/rest/v1/cad_equipe?select=%2A&nome=eq.Condom%C3%ADnio%20Civil%20Mau%C3%A1%20Office%20Cen&ativo=eq.True&loja_id=eq.1c9311a7-1031-46e6-9db4-c3ff106ca855 "HTTP/1.1 200 OK"
2025-06-24 01:02:05,697 - httpx - INFO - HTTP Request: GET https://momwbpxqnvgehotfmvde.supabase.co/rest/v1/cad_equipe?select=%2A&email=eq.quele.pereira%40mauaplaza.com.br&ativo=eq.True&loja_id=eq.1c9311a7-1031-46e6-9db4-c3ff106ca855 "HTTP/1.1 200 OK"
2025-06-24 01:02:05,894 - httpx - INFO - HTTP Request: POST https://momwbpxqnvgehotfmvde.supabase.co/rest/v1/cad_equipe "HTTP/1.1 201 Created"
2025-06-24 01:02:06,110 - httpx - INFO - HTTP Request: GET https://momwbpxqnvgehotfmvde.supabase.co/rest/v1/cad_equipe?select=%2A&id=eq.158efe63-b643-4bfd-97cd-9e656762f5a5&ativo=eq.True&loja_id=eq.1c9311a7-1031-46e6-9db4-c3ff106ca855 "HTTP/1.1 200 OK"
2025-06-24 01:02:06,297 - httpx - INFO - HTTP Request: GET https://momwbpxqnvgehotfmvde.supabase.co/rest/v1/c_lojas?select=nome&id=eq.1c9311a7-1031-46e6-9db4-c3ff106ca855 "HTTP/1.1 200 OK"
2025-06-24 01:02:06,641 - httpx - INFO - HTTP Request: GET https://momwbpxqnvgehotfmvde.supabase.co/rest/v1/cad_setores?select=nome&id=eq.b54209a6-50ac-41f6-bf2c-996b6fe0bf2d "HTTP/1.1 200 OK"
2025-06-24 01:02:06,642 - modules.equipe.services - INFO - Funcionário criado: 158efe63-b643-4bfd-97cd-9e656762f5a5 por usuário 03de5532-db40-4f78-aa66-63d30060ea4e
2025-06-24 01:02:06,642 - modules.equipe.controller - INFO - Funcionário criado: 158efe63-b643-4bfd-97cd-9e656762f5a5 por usuário 03de5532-db40-4f78-aa66-63d30060ea4e
2025-06-24 01:02:06,642 - main - INFO - RESPONSE: 201 in 2.412s
INFO:     127.0.0.1:58750 - "POST /api/v1/equipe/ HTTP/1.1" 201 Created