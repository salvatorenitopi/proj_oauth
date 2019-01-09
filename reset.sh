#!/bin/sh

echo; echo "---------------------------------------------------"; echo "[*] DOING oauth_authorization_server"
cd oauth_authorization_server
npm install
rm db.json
node create_db.js
rm cert.pem
rm key.pem
rm session-store.db
cd ..

echo; echo "---------------------------------------------------"; echo "[*] DOING oauth_resource_server"
cd oauth_resource_server
npm install
rm db.json
node create_db.js
rm cert.pem
rm key.pem
rm session-store.db
cd ..

echo; echo "---------------------------------------------------"; echo "[*] DOING client_1_authorization_code"
cd client_1_authorization_code
npm install
rm cert.pem
rm key.pem
rm session-store.db
cd ..

echo; echo "---------------------------------------------------"; echo "[*] DOING client_2_implicit"
cd client_2_implicit
npm install
rm cert.pem
rm key.pem
rm session-store.db
cd ..

echo; echo "---------------------------------------------------"; echo "[*] DOING client_3_password"
cd client_3_password
npm install
rm cert.pem
rm key.pem
rm session-store.db
cd ..

echo; echo "---------------------------------------------------"; echo "[*] DOING client_4_client_credentials"
cd client_4_client_credentials
npm install
rm cert.pem
rm key.pem
rm session-store.db
cd ..

echo; echo "---------------------------------------------------"; echo "[*] DOING CERTIFICATES"

(echo "-----BEGIN CERTIFICATE-----
MIIDtTCCAp2gAwIBAgIJANdmqU91Ryd6MA0GCSqGSIb3DQEBBQUAMEUxCzAJBgNV
BAYTAkFVMRMwEQYDVQQIEwpTb21lLVN0YXRlMSEwHwYDVQQKExhJbnRlcm5ldCBX
aWRnaXRzIFB0eSBMdGQwHhcNMTgwODIxMTUzNjQ3WhcNMTkwODIxMTUzNjQ3WjBF
MQswCQYDVQQGEwJBVTETMBEGA1UECBMKU29tZS1TdGF0ZTEhMB8GA1UEChMYSW50
ZXJuZXQgV2lkZ2l0cyBQdHkgTHRkMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIB
CgKCAQEAzeXboxsucVIkXrdn17R5/aJ1gyFsRaNQPbeMttPo2hXXgIy0uQaRQeeY
SOHPlRWvPpSyjRA094Pa5AE89j3pIj34X1wxOliRMgGCZJyotUkVtx4dWuuuuXF+
H030iKZtwNw088ZqyKq56vzg5tBjVX6JLTTh7LCeR4ztRJyAqOwNBHup6KWADG5t
K7wH1hHyGBG3Wj7FOdRyBu0VZVGvA2cUoQdkfUnIDESA0Dn5ZZtGhZ+UI3xmQ/5A
ToToI7CU7PQZmUP6Pht6eZE6awqM8ImC8UetSMlxNo6wglupa/iJ3+58iVxfgBcM
zKHKnLQP3PT81NgnhAMr+o2WbZkIzwIDAQABo4GnMIGkMB0GA1UdDgQWBBRKlyvE
M8ZWCAUlks+iophTOYSACTB1BgNVHSMEbjBsgBRKlyvEM8ZWCAUlks+iophTOYSA
CaFJpEcwRTELMAkGA1UEBhMCQVUxEzARBgNVBAgTClNvbWUtU3RhdGUxITAfBgNV
BAoTGEludGVybmV0IFdpZGdpdHMgUHR5IEx0ZIIJANdmqU91Ryd6MAwGA1UdEwQF
MAMBAf8wDQYJKoZIhvcNAQEFBQADggEBACbwfFoAZr295KrU4+At1jWbbkUZkbn6
+TPxa3prSCts9YYWD90JOMOuTo4+9+cOceb47I8UKVjA1R8PAQSm6MlT1ll8Mmf3
fhAjQtBLaXzzyrgEtf2IIC03ax6uTB2rLTzMo0HmUJT6wqiM4K5WmIFnEXQ/I/qF
3BBst8JhglfmWNxWI+UslKlj1SfY8PEmHpOHuhGYaEDybv3tPYmLb5YwJngGecTY
nn+SblPsXMYhmTpD5az6YRd4Rogd6hna2fAbaFBopBIVz01lA82sYnU/2P+axoBL
rcKCgwWWXe8q6lLFdCrNouUHoi3IV6ARDcHYy+e9u+hRKvJieUt3O6U=
-----END CERTIFICATE-----
") > cert.pem


(echo "-----BEGIN RSA PRIVATE KEY-----
MIIEpQIBAAKCAQEAzeXboxsucVIkXrdn17R5/aJ1gyFsRaNQPbeMttPo2hXXgIy0
uQaRQeeYSOHPlRWvPpSyjRA094Pa5AE89j3pIj34X1wxOliRMgGCZJyotUkVtx4d
WuuuuXF+H030iKZtwNw088ZqyKq56vzg5tBjVX6JLTTh7LCeR4ztRJyAqOwNBHup
6KWADG5tK7wH1hHyGBG3Wj7FOdRyBu0VZVGvA2cUoQdkfUnIDESA0Dn5ZZtGhZ+U
I3xmQ/5AToToI7CU7PQZmUP6Pht6eZE6awqM8ImC8UetSMlxNo6wglupa/iJ3+58
iVxfgBcMzKHKnLQP3PT81NgnhAMr+o2WbZkIzwIDAQABAoIBABTLgUpQ5Xjmfevf
BCrh/Gwka0/qIUBLRUBmeFzCvELCb/h4vYvuYN9SH6xEui1pekCMzhe3KlJRS9s5
UMnh6Njff2VKL2KgLVHqmxvEQrnEft/2t6pGIWhzUPSib+8ZN/6Bfwub348SxyI3
lhNZup6Y4AvjymmYUPQTBKeoUso8lo1xJfKgRFwJQu1XgUR4yNrsTJV7uuHPjDs8
L1btN212jbx2A7t0YZyW1c6YtI8rBII9x8mSbV8luZUtVoAV6r1OjpCZnO50KFid
AvYpqOFkQBCswkQM2Xef2L9XMls/z0UhgXoidPpvSZ5Ef8Bpi2z3t6HBSrxQsb45
8v4kjuECgYEA72j0yYsj70gfGSk9UyzyjdtBw3eJFCXcReOeiNSI45jjyT8WOwFM
iolxe9+5K0OVchtg7Ye56LDqtWYl0dskQPiXHqzHdo5B4K8k+nd5n6w5+e63Wo4A
Yzp4BzkCgzurjug2N4AiG1n53KQ1ono02Va9IuoCfdMMDsFyQEuTarECgYEA3Cpo
2S4eeg1OoibVjLVrdKXQKkXxC8rQwmeX71dUBDSjHhd/1RLweXX3ZgogOU976/WB
/E1Qvrjl9BKvx13rjmzAdhBVKOkWfEAt16JSROfoSjPEYlLbZ+2Smu4msCFxRwv0
0EkVyjS5NQxgoWOd48Z+OCddyQjSXoMbXd1Zi38CgYEAlL+ib+LKle46nDh6SMaB
gc/74UXQ3rrTTH0rUBq1Xqvsw2o2Fr0s4FqbLvsHIrFgFkCajZqp0MCzY7euwd+l
e9S4mC+D0s56ce6ATDqVT7cDYp2GQHZAGWcHkn1CaWVWp3jxzrQG/PV/gC5qwKOr
WGpDI4E/wQuyzyw0H2yVkFECgYEAvJgLhnaOHskFYbtYVJcXfC2Jepy9FfffCZiJ
urkYvB2G2QESPKhjm/fkO+FSpyUiJwcAGOr1zto+COx07JfUbwVTfA8Tk97OpxKm
8j8Wr/XjsqRThlIppgYI/nQgaeHL0is4w67HXpX5TKrUn4rgtjvS5TE7kjjfU5yF
Nculp+sCgYEApjQSmY9sOHxu8Ld4gkNZbyNv+n4Ttmo7yewxU3iv+n++J0Z+0Uny
LzmnHDIZe+0a7US9EnN45g0OncVT2f8xI8DGk/7Ir/9LaiX+vTAI3YxyUhu0DM3R
p8xgwL+zY7tzH15Wj0/xbIMK0fQKvyNoOjbNXeTmYsEgWKVD+YwfrhY=
-----END RSA PRIVATE KEY-----") > key.pem

cp cert.pem oauth_authorization_server/
cp cert.pem oauth_resource_server/
cp cert.pem client_1_authorization_code/
cp cert.pem client_2_implicit/
cp cert.pem client_3_password/
cp cert.pem client_4_client_credentials/

cp key.pem oauth_authorization_server/
cp key.pem oauth_resource_server/
cp key.pem client_1_authorization_code/
cp key.pem client_2_implicit/
cp key.pem client_3_password/
cp key.pem client_4_client_credentials/

rm cert.pem
rm key.pem

echo; echo "---------------------------------------------------"; echo "[*] DONE"