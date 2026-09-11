# Atlas de Teoría Política — Esquema de datos V2

## Objetivo

El esquema V2 convierte el Atlas en una base de conocimiento relacional. La obra deja de ser el único objeto central: autores, conceptos, problemas, tradiciones, épocas, contextos históricos, entidades políticas y relaciones adquieren IDs estables y pueden ser consultados de manera independiente.

La migración es compatible con la aplicación actual. WORKS, CONCEPTS, RELATIONS y las demás estructuras heredadas siguen funcionando mientras ATLAS_DB actúa como capa normalizada para los desarrollos futuros.

## Entidades

### works
Clave: ID histórico de la obra, por ejemplo leviathan.

Campos principales: id, title, authorId, authorLabel, dateLabel, eraId, traditionId, conceptIds, problemIds, problemText, thesis, contextText y referencias al texto primario.

### authors
ID: author:<slug>. Puede representar persona, autoría colectiva o tradición textual. Las autorías colectivas conservan members[].

### concepts
ID: concept:<slug>. Incluye etiqueta, definición editorial y obras vinculadas.

### problems
Taxonomía transversal del Atlas. Ejemplos: justice, sovereignty-state, liberty-domination, representation-consent, race-coloniality. Cada obra recibe entre uno y cuatro problemas mediante una asignación inicial basada en conceptos y texto. Las asignaciones automáticas deben poder ser revisadas editorialmente.

### traditions
ID: tradition:<slug>. Agrupa obras sin identificar tradición y autor como la misma cosa.

### eras
ID: era:<id>. Conserva la periodización pedagógica actualmente utilizada por el Atlas.

### contexts
ID: context:<id>. Provienen de “Mundo y contextos” e incluyen resumen, orden político, estructura social, legitimidad, conflictos, pregunta rectora, obras, acontecimientos y entidades políticas.

### politicalEntities
Entidades políticas históricas vinculadas a contextos y cartografía.

### genealogies
Genealogías editoriales del Atlas. No equivalen automáticamente a cadenas de influencia histórica.

### researchSources
Directorios y bases académicas para investigación. Las citas bibliográficas específicas de cada afirmación se incorporarán en el Paso 5.

## Relaciones

Toda relación posee sourceType, sourceId, predicate, targetType, targetId, status y evidence cuando corresponde.

### Relaciones estructurales
authored_by; member_of; uses_concept; addresses_problem; belongs_to_tradition; situated_in_era; situated_in_context; context_contains_entity.

### Relaciones intelectuales
documented_influence; reception; critique; critical_reception; reinterpretation; conceptual_predecessor; shared_tradition; co_development; intellectual_dialogue.

### Regla editorial fundamental

Una flecha no significa “influencia” por defecto.

Cuando la relación heredada no puede clasificarse con seguridad, se conserva como legacy_intellectual_relation con estado needs_review. Esto permite distinguir evidencia histórica de comparación conceptual.

## API

window.AtlasDB expone inicialmente get(type,id), list(type), relationsFor(type,id,predicate?), worksByAuthor(authorId), worksByConcept(conceptId), worksByProblem(problemId) y search(query).

## Principios editoriales para el crecimiento

1. Todo objeto nuevo debe tener ID estable.
2. No duplicar autores o conceptos mediante variaciones ortográficas.
3. Diferenciar autor individual, autoría colectiva y tradición textual.
4. Toda relación intelectual debe especificar su tipo.
5. Las relaciones no verificadas deben marcarse como pendientes, nunca presentarse como influencia.
6. Contexto histórico y contenido doctrinal son entidades relacionadas, no equivalentes.
7. Los problemas permiten comparación transversal, pero no implican identidad semántica entre conceptos históricos.
8. En el Paso 5, cada relación y afirmación relevante podrá incorporar fuentes y nivel de evidencia.

## Rol del esquema V2 en la hoja de ruta

Este esquema será la base para URLs permanentes, fichas de Autor/Concepto/Problema, sistema de citas, comparador, mapa cartográfico y motor relacional.

El objetivo final es que el Atlas funcione como una enciclopedia especializada de teoría política, con la trazabilidad y navegación de una wiki pero con una ontología disciplinar más rigurosa.