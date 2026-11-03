# Seguridad

## Cómo avisar de una vulnerabilidad

**No abras un issue público.** Usa el reporte privado de GitHub:
pestaña **Security → Report a vulnerability** de este repositorio. Solo lo ven
los responsables del proyecto.

## Qué hay en este repositorio

Es la web pública del Hotel Bahía de Cuba: HTML, CSS, JavaScript e imágenes.
**No contiene ningún secreto.** La única clave que aparece es la *anon* de
Supabase, que es pública por diseño: con ella solo se pueden leer las tarifas
y la disponibilidad. Las reservas, los huéspedes, los pagos y los reclamos
están cerrados a ese rol tanto por RLS como por permisos de tabla.

## Reglas para quien contribuya

- Nunca subas un `.env`, una clave de servicio, un token ni una contraseña.
  GitHub bloquea el push si detecta uno, pero no te fíes solo de eso.
- La rama `main` no admite `push --force` ni borrado, ni siquiera para admins.
- Si alguna vez se filtra una credencial, **no basta con borrar el commit**:
  hay que revocarla y generar otra en el panel del servicio, porque el
  historial de un repo público se copia en minutos.
