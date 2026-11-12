# Wiki editorial V5

La versión conserva el corpus y las rutas existentes. `wiki-v5.js` agrega búsqueda global sin dependencias externas, comparador de 2–4 obras con CSV y enlace compartible, explorador de relaciones, referencias del Atlas en APA/Chicago/BibTeX, cuaderno local y tamaño de lectura. `wiki-v5.css` define la navegación y el diseño editorial responsive.

## Integridad

Se corrigió una clave sin comillas (`bolivar-j`) que impedía ejecutar corrections.js y por lo tanto cargar las guías argentinas dependientes de DEEP_GUIDES. Se corrigió el índice de secciones para que no reemplace el permalink del artículo. Las métricas de portada usan las entidades normalizadas.

## Límites editoriales explícitos

La exportación cita el artículo del Atlas, no una edición primaria. La bibliografía heredada aún requiere normalización y verificación bibliográfica. Las relaciones tipificadas no se consideran documentadas por el solo hecho de tener categoría. El explorador es determinista: consulta relaciones registradas, no infiere genealogías históricas. El mapa existente continúa siendo esquemático. No se implementó edición colaborativa, cuentas ni cartografía histórica GeoJSON.

## Verificación

- Comprobación de sintaxis de todos los scripts raíz.
- Carga de capas de datos y guías en Node: 137 obras, 140 autorías, 234 conceptos; ninguna guía por debajo de los mínimos estructurales; ninguna relación con extremos ausentes.
- Navegador: portada, búsqueda Hobbes, dossier Leviatán, comparación con Rousseau, índice de autores, ficha Hobbes, índice interno conservando permalink y panel de cita.

Las preferencias y selecciones se guardan únicamente en localStorage. No se incorporan servicios de seguimiento, dependencias CDN nuevas ni envíos de contenido personal.
