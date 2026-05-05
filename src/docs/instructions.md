## Endpoints do módulo Admin
- POST	`/admin/resultado` | Basic Auth |	_Insere resultado de um jogo e recalcula pontuação._
- POST	`/admin/recalcular`	| Basic Auth |	_Força recálculo de toda pontuação do sistema._
- GET	`/admin/dashboard` |	Basic Auth	| _Estatísticas gerais do sistema._

---

## Exemplo de uso
### 1. Atualizar resultado
```bash
curl -X POST $API_URL/admin/resultado \
  -u admin_user:admin_password \
  -H "Content-Type: application/json" \
  -d '{"jogo_id": 1, "gols_a": 2, "gols_b": 1}'
  ```
  ---
  ### 2. Recalcular pontuação geral
```bash
curl -X POST $API_URL/admin/recalcular \
  -u admin_user:admin_password
```
---
### 3. Dashboard
```bash
curl $API_URL/admin/dashboard \
  -u admin_user:admin_password
```
---
### Resposta exemplo:
```json
{
  "total_usuarios": 10,
  "total_apostas": 450,
  "total_jogos": 64,
  "jogos_encerrados": 32,
  "jogos_pendentes": 32,
  "usuarios_com_apostas": 10,
  "media_apostas_por_usuario": 45
}
```