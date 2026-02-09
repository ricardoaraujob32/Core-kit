-- Escrita herda Leitura (para não ter que repetir grants de SELECT no usuário)
GRANT leitura TO posse, escrita, auditoria, automacao;

-- admin (humano)
GRANT posse, migracao, escrita, leitura TO multilocatario_administrador;

-- migrador (CI/CD)
GRANT migracao TO multilocatario_migrador;

-- app (principal)
GRANT escrita TO multilocatario_aplicacao;

-- api (secundárias)
GRANT leitura TO multilocatario_leitor;

-- auditor
GRANT auditoria TO multilocatario_auditor;

-- job
GRANT automacao TO multilocatario_operador_job;

-- leitura enxerga schemas
GRANT USAGE ON SCHEMA core TO corekit_leitura;
GRANT USAGE ON SCHEMA jobs TO corekit_leitura;

-- escrita enxerga schemas (via herança) e faz DML (não precisa CREATE)
GRANT USAGE ON SCHEMA core TO corekit_escrita;
GRANT USAGE ON SCHEMA jobs TO corekit_escrita;

-- auditor enxerga auditoria
GRANT USAGE ON SCHEMA auditoria TO corekit_auditor;

-- job enxerga jobs (e opcionalmente core)
GRANT USAGE ON SCHEMA jobs TO corekit_job;
GRANT USAGE ON SCHEMA core TO corekit_job; -- opcional, se job precisar ler core

-- migrador pode criar objetos
GRANT USAGE, CREATE ON SCHEMA core TO corekit_migrador;
GRANT USAGE, CREATE ON SCHEMA jobs TO corekit_migrador;
GRANT USAGE, CREATE ON SCHEMA auditoria TO corekit_migrador;

-- hardening: bloquear CREATE do PUBLIC
REVOKE CREATE ON SCHEMA core FROM PUBLIC;
REVOKE CREATE ON SCHEMA jobs FROM PUBLIC;
REVOKE CREATE ON SCHEMA auditoria FROM PUBLIC;

