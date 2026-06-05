/**
 * learning-routes.js — Rutas de aprendizaje para programas acad\u00e9micos
 *
 * Estructura: { [progId]: { id, espId, espName, type, credits, semesters[] } }
 * Lookup O(1) por progId.
 *
 * Datos del pensum: Universidad de Cundinamarca — Res. No.023930 del 12/12/2023 MEN
 * Fuente: https://www.ucundinamarca.edu.co/index.php/posgrado/especializaciones/agroecologia-y-desarrollo-agroecoturistico
 */
window.__LEARNING_ROUTES = {
  "id17749182094742u1": {
    id: "lr-agroeco",
    espId: "id17749182094742u1",
    type: "especializacion",
    espName: "Esp. en Agroecolog\u00eda y Desarrollo Agroecotur\u00edstico",
    credits: 20,
    semesters: [
      {
        id: "sem1",
        title: "Semestre 1",
        type: "Fundamentaci\u00f3n",
        credits: 10,
        subjects: [
          { id: "subj1", title: "Econom\u00eda rural y pol\u00edtica p\u00fablica",             credits: 2, homologa: true  },
          { id: "subj2", title: "Modelos de producci\u00f3n agropecuarios",                  credits: 2, homologa: true  },
          { id: "subj3", title: "Gesti\u00f3n ambiental y territorio",                        credits: 3, homologa: false },
          { id: "subj4", title: "C\u00e1tedra Generaci\u00f3n siglo 21",                     credits: 1, homologa: false },
          { id: "subj5", title: "Lengua Extranjera MCRE B2",                                  credits: 2, homologa: false },
        ]
      },
      {
        id: "sem2",
        title: "Semestre 2",
        type: "Profundizaci\u00f3n",
        credits: 10,
        subjects: [
          { id: "subj6", title: "Seguridad alimentaria y cultivos andinos",                   credits: 3, homologa: true  },
          { id: "subj7", title: "Sistemas de producci\u00f3n ecol\u00f3gicos",                credits: 2, homologa: true  },
          { id: "subj8", title: "Ciencia Tecnolog\u00eda e Innovaci\u00f3n",                  credits: 2, homologa: false },
          { id: "subj9", title: "Agroecoturismo",                                             credits: 3, homologa: false },
        ]
      }
    ]
  },
  "id1774918209474cat": {
    id: "lr-nutricion",
    espId: "id1774918209474cat",
    type: "especializacion",
    espName: "Especializaci\u00f3n en Nutrici\u00f3n y Alimentaci\u00f3n Animal de Especies no Convencionales",
    credits: 20,
    semesters: [
      {
        id: "sem1",
        title: "Semestre 1",
        type: "Fundamentaci\u00f3n",
        credits: 10,
        subjects: [
          { id: "nsubj1", title: "Metabolismo de Nutrientes en Monog\u00e1stricos y polig\u00e1stricos",                     credits: 2, homologa: true  },
          { id: "nsubj2", title: "T\u00e9cnicas de laboratorio para an\u00e1lisis de alimentos",                            credits: 3, homologa: false },
          { id: "nsubj3", title: "Estrategias de Alimentaci\u00f3n y Formulaci\u00f3n de Raciones en Pseudorumiantes (Equinos y Conejos)", credits: 2, homologa: true  },
          { id: "nsubj4", title: "Lengua Extranjera Nivel MCRE B2",                                                         credits: 2, homologa: false },
          { id: "nsubj5", title: "C\u00e1tedra Generaci\u00f3n Siglo 21",                                                  credits: 1, homologa: false },
        ]
      },
      {
        id: "sem2",
        title: "Semestre 2",
        type: "Profundizaci\u00f3n",
        credits: 10,
        subjects: [
          { id: "nsubj6", title: "Materias primas no convencionales y aditivos para dietas de especies alternativas",         credits: 2, homologa: true  },
          { id: "nsubj7", title: "Estrategias de Alimentaci\u00f3n y Formulaci\u00f3n de Raciones en Ovinos y Caprinos",    credits: 2, homologa: false },
          { id: "nsubj8", title: "Manejo Nutricional para el desempe\u00f1o reproductivo en ovinos y caprinos",              credits: 2, homologa: true  },
          { id: "nsubj9", title: "Estrategias de Alimentaci\u00f3n y Raciones en Fauna Silvestre",                           credits: 2, homologa: true  },
          { id: "nsubj10", title: "Ciencia, Tecnolog\u00eda e innovaci\u00f3n",                                              credits: 2, homologa: false },
        ]
      }
    ]
  },
  "id1774918209474rky": {
    id: "lr-gestion-publica",
    espId: "id1774918209474rky",
    type: "especializacion",
    espName: "Especializaci\u00f3n en Gesti\u00f3n P\u00fablica",
    credits: 20,
    semesters: [
      {
        id: "sem1",
        title: "Semestre 1",
        type: "Fundamentaci\u00f3n",
        credits: 10,
        subjects: [
          { id: "gsubj1", title: "Econom\u00eda de lo P\u00fablico",                                                          credits: 2, homologa: true  },
          { id: "gsubj2", title: "Modelo Integral de Planeaci\u00f3n y Gesti\u00f3n (MIPG)",                                  credits: 3, homologa: false },
          { id: "gsubj3", title: "Estructura del Estado Colombiano y Gobernanza de las Pol\u00edticas P\u00fablicas",         credits: 2, homologa: true  },
          { id: "gsubj4", title: "Lengua Extranjera B2",                                                                      credits: 2, homologa: false },
          { id: "gsubj5", title: "C\u00e1tedra Generaci\u00f3n Siglo XXI",                                                    credits: 1, homologa: false },
        ]
      },
      {
        id: "sem2",
        title: "Semestre 2",
        type: "Profundizaci\u00f3n",
        credits: 10,
        subjects: [
          { id: "gsubj6", title: "Presupuesto y Finanzas P\u00fablicas",                                                      credits: 2, homologa: true  },
          { id: "gsubj7", title: "An\u00e1lisis y gesti\u00f3n de las organizaciones p\u00fablicas",                          credits: 2, homologa: true  },
          { id: "gsubj8", title: "Contrataci\u00f3n Estatal",                                                                 credits: 2, homologa: true  },
          { id: "gsubj9", title: "Desarrollo y Gesti\u00f3n Territorial",                                                     credits: 2, homologa: false },
          { id: "gsubj10", title: "Ciencia, Tecnolog\u00eda e Innovaci\u00f3n",                                               credits: 2, homologa: false },
        ]
      }
    ]
  },
  "id1774918209474720": {
    id: "lr-transformacion-digital",
    espId: "id1774918209474720",
    type: "especializacion",
    espName: "Esp. Gerencia para la Transformaci\u00f3n Digital",
    credits: 20,
    semesters: [
      {
        id: "sem1",
        title: "Semestre 1",
        type: "Fundamentaci\u00f3n",
        credits: 9,
        subjects: [
          { id: "tsubj1", title: "Pensamiento Estrat\u00e9gico",                                                                    credits: 2, homologa: true  },
          { id: "tsubj2", title: "Gesti\u00f3n del cambio y cultura digital",                                                       credits: 2, homologa: true  },
          { id: "tsubj3", title: "Gesti\u00f3n de tecnolog\u00edas de informaci\u00f3n y comunicaci\u00f3n TIC",                   credits: 2, homologa: true  },
          { id: "tsubj4", title: "Lengua Extranjera B2",                                                                           credits: 2, homologa: false },
          { id: "tsubj5", title: "C\u00e1tedra Generaci\u00f3n Siglo XXI",                                                         credits: 1, homologa: false },
        ]
      },
      {
        id: "sem2",
        title: "Semestre 2",
        type: "Profundizaci\u00f3n",
        credits: 11,
        subjects: [
          { id: "tsubj6", title: "Dise\u00f1o de productos servicios y modelos de negocio",                                        credits: 2, homologa: false },
          { id: "tsubj7", title: "Plan de Marketing Digital",                                                                       credits: 2, homologa: false },
          { id: "tsubj8", title: "Anal\u00edtica de negocios",                                                                      credits: 2, homologa: true  },
          { id: "tsubj9", title: "Plan para la transformaci\u00f3n digital",                                                        credits: 3, homologa: false },
          { id: "tsubj10", title: "Ciencia, Tecnolog\u00eda e Innovaci\u00f3n",                                                     credits: 2, homologa: false },
        ]
      }
    ]
  },
  "id1774918209474pfl": {
    id: "lr-marketing-digital",
    espId: "id1774918209474pfl",
    type: "especializacion",
    espName: "Especializaci\u00f3n en Marketing Digital",
    credits: 20,
    semesters: [
      {
        id: "sem1",
        title: "Semestre 1",
        type: "Fundamentaci\u00f3n",
        credits: 9,
        subjects: [
          { id: "msubj1", title: "Redes sociales en el marketing digital",                   credits: 2, homologa: true  },
          { id: "msubj2", title: "Psicolog\u00eda del consumidor digital",                     credits: 2, homologa: true  },
          { id: "msubj3", title: "Investigaci\u00f3n de mercados digital",                    credits: 2, homologa: true  },
          { id: "msubj4", title: "Lengua Extranjera B2",                                       credits: 2, homologa: false },
          { id: "msubj5", title: "C\u00e1tedra Generaci\u00f3n Siglo XXI",                     credits: 1, homologa: false },
        ]
      },
      {
        id: "sem2",
        title: "Semestre 2",
        type: "Profundizaci\u00f3n",
        credits: 11,
        subjects: [
          { id: "msubj6", title: "Marketing de contenidos",                                    credits: 2, homologa: true  },
          { id: "msubj7", title: "Comercio y venta de productos y servicios online",           credits: 2, homologa: true  },
          { id: "msubj8", title: "Anal\u00edtica digital",                                      credits: 2, homologa: false },
          { id: "msubj9", title: "Plan de marketing estrat\u00e9gico digital",                 credits: 3, homologa: false },
          { id: "msubj10", title: "Ciencia, Tecnolog\u00eda e Innovaci\u00f3n",                 credits: 2, homologa: false },
        ]
      }
    ]
  },
  "id1774918209474vuu": {
    id: "lr-agronegocios",
    espId: "id1774918209474vuu",
    type: "especializacion",
    espName: "Especializaci\u00f3n en Agronegocios Sostenibles",
    credits: 20,
    semesters: [
      {
        id: "sem1",
        title: "Semestre 1",
        type: "Fundamentaci\u00f3n",
        credits: 10,
        subjects: [
          { id: "asubj1", title: "Comercio Nacional e Internacional",                                                          credits: 2, homologa: true  },
          { id: "asubj2", title: "Cadenas de Abastecimiento",                                                                   credits: 2, homologa: true  },
          { id: "asubj3", title: "Dise\u00f1o, Evaluaci\u00f3n y Gesti\u00f3n de Proyectos de Desarrollo Sostenible",         credits: 3, homologa: false },
          { id: "asubj4", title: "Lengua extranjera en el nivel MCRE B2",                                                       credits: 2, homologa: false },
          { id: "asubj5", title: "C\u00e1tedra Generaci\u00f3n Siglo XXI",                                                     credits: 1, homologa: false },
        ]
      },
      {
        id: "sem2",
        title: "Semestre 2",
        type: "Profundizaci\u00f3n",
        credits: 10,
        subjects: [
          { id: "asubj6", title: "Pensamiento Estrat\u00e9gico y Liderazgo",                                                   credits: 2, homologa: true  },
          { id: "asubj7", title: "Gesti\u00f3n Financiera",                                                                     credits: 2, homologa: false },
          { id: "asubj8", title: "Mercadeo y Comercializaci\u00f3n en agronegocios Sostenibles",                                credits: 2, homologa: true  },
          { id: "asubj9", title: "TIC aplicadas a la industria de productos agr\u00edcolas",                                    credits: 2, homologa: true  },
          { id: "asubj10", title: "Ciencia, Tecnolog\u00eda e Innovaci\u00f3n - CTI",                                           credits: 2, homologa: false },
        ]
      }
    ]
  },
  "id17749182094742q2": {
    id: "lr-analitica-negocios",
    espId: "id17749182094742q2",
    type: "especializacion",
    espName: "Especializaci\u00f3n en Anal\u00edtica Aplicada a Negocios",
    credits: 20,
    semesters: [
      {
        id: "sem1",
        title: "Semestre 1",
        type: "Fundamentaci\u00f3n",
        credits: 10,
        subjects: [
          { id: "bsubj1", title: "Fundamentos en Big Data",                                                                     credits: 2, homologa: true  },
          { id: "bsubj2", title: "Anal\u00edtica Predictiva",                                                                   credits: 2, homologa: true  },
          { id: "bsubj3", title: "Innovaci\u00f3n y Aplicaciones Digitales",                                                    credits: 3, homologa: false },
          { id: "bsubj4", title: "Lengua extranjera en el nivel MCRE B2",                                                       credits: 2, homologa: false },
          { id: "bsubj5", title: "C\u00e1tedra Generaci\u00f3n Siglo XXI",                                                     credits: 1, homologa: false },
        ]
      },
      {
        id: "sem2",
        title: "Semestre 2",
        type: "Profundizaci\u00f3n",
        credits: 10,
        subjects: [
          { id: "bsubj6", title: "An\u00e1lisis de Big Data",                                                                   credits: 2, homologa: false },
          { id: "bsubj7", title: "Modelos de Negocios",                                                                          credits: 2, homologa: true  },
          { id: "bsubj8", title: "Gesti\u00f3n de Datos para Toma de Decisiones",                                               credits: 2, homologa: true  },
          { id: "bsubj9", title: "Arquitectura de negocios",                                                                     credits: 2, homologa: true  },
          { id: "bsubj10", title: "Ciencia, Tecnolog\u00eda e Innovaci\u00f3n",                                                  credits: 2, homologa: false },
        ]
      }
    ]
  },
  "id1774918209474mir": {
    id: "lr-analitica-negocios-industrial",
    espId: "id1774918209474mir",
    type: "especializacion",
    espName: "Especializaci\u00f3n en Anal\u00edtica Aplicada a Negocios",
    credits: 20,
    semesters: [
      {
        id: "sem1",
        title: "Semestre 1",
        type: "Fundamentaci\u00f3n",
        credits: 10,
        subjects: [
          { id: "bsubj1", title: "Fundamentos en Big Data",                                                                     credits: 2, homologa: true  },
          { id: "bsubj2", title: "Anal\u00edtica Predictiva",                                                                   credits: 2, homologa: true  },
          { id: "bsubj3", title: "Innovaci\u00f3n y Aplicaciones Digitales",                                                    credits: 3, homologa: false },
          { id: "bsubj4", title: "Lengua extranjera en el nivel MCRE B2",                                                       credits: 2, homologa: false },
          { id: "bsubj5", title: "C\u00e1tedra Generaci\u00f3n Siglo XXI",                                                     credits: 1, homologa: false },
        ]
      },
      {
        id: "sem2",
        title: "Semestre 2",
        type: "Profundizaci\u00f3n",
        credits: 10,
        subjects: [
          { id: "bsubj6", title: "An\u00e1lisis de Big Data",                                                                   credits: 2, homologa: false },
          { id: "bsubj7", title: "Modelos de Negocios",                                                                          credits: 2, homologa: true  },
          { id: "bsubj8", title: "Gesti\u00f3n de Datos para Toma de Decisiones",                                               credits: 2, homologa: true  },
          { id: "bsubj9", title: "Arquitectura de negocios",                                                                     credits: 2, homologa: true  },
          { id: "bsubj10", title: "Ciencia, Tecnolog\u00eda e Innovaci\u00f3n",                                                  credits: 2, homologa: false },
        ]
      }
    ]
  },
  "id177491820947414p": {
    id: "lr-deporte-escolar",
    espId: "id177491820947414p",
    type: "especializacion",
    espName: "Especializaci\u00f3n en Deporte Escolar",
    credits: 20,
    semesters: [
      {
        id: "sem1",
        title: "Semestre 1",
        type: "Fundamentaci\u00f3n",
        credits: 10,
        subjects: [
          { id: "dsubj1", title: "Aprendizaje y desarrollo motor en el contexto deportivo",     credits: 2, homologa: true  },
          { id: "dsubj2", title: "Fisiolog\u00eda del ejercicio en ni\u00f1os y adolescentes",  credits: 3, homologa: true  },
          { id: "dsubj3", title: "Bases Te\u00f3ricas",                                           credits: 2, homologa: true  },
          { id: "dsubj4", title: "Evaluaci\u00f3n y Control",                                    credits: 2, homologa: true  },
          { id: "dsubj5", title: "Generaci\u00f3n Siglo 21",                                    credits: 1, homologa: false },
        ]
      },
      {
        id: "sem2",
        title: "Semestre 2",
        type: "Profundizaci\u00f3n",
        credits: 10,
        subjects: [
          { id: "dsubj6", title: "Deporte en etapas de iniciaci\u00f3n y formaci\u00f3n",       credits: 2, homologa: true  },
          { id: "dsubj7", title: "Entrenamiento Deporte Adaptado",                               credits: 2, homologa: true  },
          { id: "dsubj8", title: "Pedagog\u00eda en el deporte Escolar",                         credits: 2, homologa: true  },
          { id: "dsubj9", title: "Lengua Extranjera B2.1",                                       credits: 2, homologa: false },
          { id: "dsubj10", title: "Ciencia Tecnolog\u00eda e Innovaci\u00f3n",                   credits: 2, homologa: false },
        ]
      }
    ]
  },
  "id1774918209474eru": {
    id: "lr-analitica-datos",
    espId: "id1774918209474eru",
    type: "especializacion",
    espName: "Especializaci\u00f3n en Anal\u00edtica y Ciencia de Datos",
    credits: 20,
    semesters: [
      {
        id: "sem1",
        title: "Semestre 1",
        type: "Fundamentaci\u00f3n",
        credits: 10,
        subjects: [
          { id: "esubj1", title: "Big Data",                                                                                    credits: 2, homologa: true  },
          { id: "esubj2", title: "Introducci\u00f3n a Machine Learning",                                                        credits: 2, homologa: true  },
          { id: "esubj3", title: "Dise\u00f1o estad\u00edstico para datos estructurados y no estructurados",                   credits: 3, homologa: false },
          { id: "esubj4", title: "C\u00e1tedra Generaci\u00f3n Siglo 21",                                                       credits: 1, homologa: false },
          { id: "esubj5", title: "Lengua extranjera en el nivel MCRE B2",                                                       credits: 2, homologa: false },
        ]
      },
      {
        id: "sem2",
        title: "Semestre 2",
        type: "Profundizaci\u00f3n",
        credits: 10,
        subjects: [
          { id: "esubj6", title: "Gesti\u00f3n de proyectos centrada en datos",                                                 credits: 2, homologa: true  },
          { id: "esubj7", title: "Business Analytics (BA)",                                                                      credits: 2, homologa: true  },
          { id: "esubj8", title: "Miner\u00eda de Datos",                                                                        credits: 2, homologa: true  },
          { id: "esubj9", title: "Aplicaci\u00f3n Machine Learning",                                                             credits: 2, homologa: false },
          { id: "esubj10", title: "Ciencia, Tecnolog\u00eda e Innovaci\u00f3n",                                                  credits: 2, homologa: false },
        ]
      }
    ]
  },
  "id1774918209474zo6": {
    id: "lr-analitica-datos-sw",
    espId: "id1774918209474zo6",
    type: "especializacion",
    espName: "Especializaci\u00f3n en Anal\u00edtica y Ciencia de Datos",
    credits: 20,
    semesters: [
      {
        id: "sem1",
        title: "Semestre 1",
        type: "Fundamentaci\u00f3n",
        credits: 10,
        subjects: [
          { id: "esubj1", title: "Big Data",                                                                                    credits: 2, homologa: true  },
          { id: "esubj2", title: "Introducci\u00f3n a Machine Learning",                                                        credits: 2, homologa: true  },
          { id: "esubj3", title: "Dise\u00f1o estad\u00edstico para datos estructurados y no estructurados",                   credits: 3, homologa: false },
          { id: "esubj4", title: "C\u00e1tedra Generaci\u00f3n Siglo 21",                                                       credits: 1, homologa: false },
          { id: "esubj5", title: "Lengua extranjera en el nivel MCRE B2",                                                       credits: 2, homologa: false },
        ]
      },
      {
        id: "sem2",
        title: "Semestre 2",
        type: "Profundizaci\u00f3n",
        credits: 10,
        subjects: [
          { id: "esubj6", title: "Gesti\u00f3n de proyectos centrada en datos",                                                 credits: 2, homologa: true  },
          { id: "esubj7", title: "Business Analytics (BA)",                                                                      credits: 2, homologa: true  },
          { id: "esubj8", title: "Miner\u00eda de Datos",                                                                        credits: 2, homologa: true  },
          { id: "esubj9", title: "Aplicaci\u00f3n Machine Learning",                                                             credits: 2, homologa: false },
          { id: "esubj10", title: "Ciencia, Tecnolog\u00eda e Innovaci\u00f3n",                                                  credits: 2, homologa: false },
        ]
      }
    ]
  },
  "id1774918209474afo": {
    id: "lr-infraestructura-redes-sistemas",
    espId: "id1774918209474afo",
    type: "especializacion",
    espName: "Especializaci\u00f3n en Infraestructura y Seguridad de Redes",
    credits: 20,
    semesters: [
      {
        id: "sem1",
        title: "Semestre 1",
        type: "Fundamentaci\u00f3n",
        credits: 10,
        subjects: [
          { id: "irsubj1", title: "Gesti\u00f3n de Infraestructuras de TI",       credits: 2, homologa: true  },
          { id: "irsubj2", title: "Redes Convergentes",                            credits: 2, homologa: true  },
          { id: "irsubj3", title: "Seguridad de Arquitectura de Redes",            credits: 3, homologa: false },
          { id: "irsubj4", title: "Infraestructuras Inal\u00e1mbricas",            credits: 2, homologa: true  },
          { id: "irsubj5", title: "C\u00e1tedra Generaci\u00f3n Siglo 21",         credits: 1, homologa: false },
        ]
      },
      {
        id: "sem2",
        title: "Semestre 2",
        type: "Profundizaci\u00f3n",
        credits: 10,
        subjects: [
          { id: "irsubj6", title: "Gesti\u00f3n de Proyectos de TI",               credits: 2, homologa: false },
          { id: "irsubj7", title: "Seguridad Perimetral",                          credits: 2, homologa: true  },
          { id: "irsubj8", title: "Redes WAN definidas por software",              credits: 2, homologa: true  },
          { id: "irsubj9", title: "Ciencia, Tecnolog\u00eda e Innovaci\u00f3n",    credits: 2, homologa: false },
          { id: "irsubj10", title: "Lengua Extranjera Nivel B2.1",                 credits: 2, homologa: false },
        ]
      }
    ]
  },
  "id177491820947445x": {
    id: "lr-infraestructura-redes-electronica",
    espId: "id177491820947445x",
    type: "especializacion",
    espName: "Especializaci\u00f3n en Infraestructura y Seguridad de Redes",
    credits: 20,
    semesters: [
      {
        id: "sem1",
        title: "Semestre 1",
        type: "Fundamentaci\u00f3n",
        credits: 10,
        subjects: [
          { id: "irsubj1", title: "Gesti\u00f3n de Infraestructuras de TI",       credits: 2, homologa: true  },
          { id: "irsubj2", title: "Redes Convergentes",                            credits: 2, homologa: true  },
          { id: "irsubj3", title: "Seguridad de Arquitectura de Redes",            credits: 3, homologa: false },
          { id: "irsubj4", title: "Infraestructuras Inal\u00e1mbricas",            credits: 2, homologa: true  },
          { id: "irsubj5", title: "C\u00e1tedra Generaci\u00f3n Siglo 21",         credits: 1, homologa: false },
        ]
      },
      {
        id: "sem2",
        title: "Semestre 2",
        type: "Profundizaci\u00f3n",
        credits: 10,
        subjects: [
          { id: "irsubj6", title: "Gesti\u00f3n de Proyectos de TI",               credits: 2, homologa: false },
          { id: "irsubj7", title: "Seguridad Perimetral",                          credits: 2, homologa: true  },
          { id: "irsubj8", title: "Redes WAN definidas por software",              credits: 2, homologa: true  },
          { id: "irsubj9", title: "Ciencia, Tecnolog\u00eda e Innovaci\u00f3n",    credits: 2, homologa: false },
          { id: "irsubj10", title: "Lengua Extranjera Nivel B2.1",                 credits: 2, homologa: false },
        ]
      }
    ]
  },
  "id17749182094747we": {
    id: "lr-recursos-zoogeneticos",
    espId: "id17749182094747we",
    type: "especializacion",
    espName: "Especializaci\u00f3n en Recursos Zoogen\u00e9ticos",
    credits: 20,
    semesters: [
      {
        id: "sem1",
        title: "Semestre 1",
        type: "Fundamentaci\u00f3n",
        credits: 10,
        subjects: [
          { id: "rzsubj1", title: "Etnozootecnia y manejo de recursos zoogen\u00e9ticos",                        credits: 2, homologa: true  },
          { id: "rzsubj2", title: "Biolog\u00eda de la conservaci\u00f3n de especies susceptibles de producci\u00f3n", credits: 3, homologa: true  },
          { id: "rzsubj3", title: "Gesti\u00f3n de proyectos en fauna silvestre",                                credits: 2, homologa: true  },
          { id: "rzsubj4", title: "Legislaci\u00f3n ambiental enfocada al manejo de la fauna silvestre",        credits: 2, homologa: false },
          { id: "rzsubj5", title: "C\u00e1tedra Generaci\u00f3n Siglo 21",                                       credits: 1, homologa: false },
        ]
      },
      {
        id: "sem2",
        title: "Semestre 2",
        type: "Profundizaci\u00f3n",
        credits: 10,
        subjects: [
          { id: "rzsubj6", title: "Manejo y conservaci\u00f3n de fauna silvestre",                              credits: 2, homologa: false },
          { id: "rzsubj7", title: "Criterios de nutrici\u00f3n y alimentaci\u00f3n en fauna silvestre",          credits: 2, homologa: false },
          { id: "rzsubj8", title: "Etolog\u00eda y bienestar animal enfocados a la fauna silvestre",            credits: 2, homologa: true  },
          { id: "rzsubj9", title: "Lengua extranjera en el nivel MCRE B2.1",                                   credits: 2, homologa: false },
          { id: "rzsubj10", title: "Ciencia, Tecnolog\u00eda e Innovaci\u00f3n",                                credits: 2, homologa: false },
        ]
      }
    ]
  },
  "id1774918209474zw7": {
    id: "lr-metodologias-calidad-sw",
    espId: "id1774918209474zw7",
    type: "especializacion",
    espName: "Esp. en Metodolog\u00edas de Calidad para el Desarrollo del Software",
    credits: 20,
    semesters: [
      {
        id: "sem1",
        title: "Semestre 1",
        type: "Fundamentaci\u00f3n",
        credits: 10,
        subjects: [
          { id: "mqsubj1", title: "Metodolog\u00edas de desarrollo tradicionales",             credits: 2, homologa: true  },
          { id: "mqsubj2", title: "Gesti\u00f3n de Proyectos de software",                      credits: 2, homologa: true  },
          { id: "mqsubj3", title: "Procesos de desarrollo de software",                         credits: 3, homologa: false },
          { id: "mqsubj4", title: "Estructura y arquitectura de software",                      credits: 1, homologa: true  },
          { id: "mqsubj5", title: "C\u00e1tedra Generaci\u00f3n Siglo 21",                       credits: 2, homologa: false },
        ]
      },
      {
        id: "sem2",
        title: "Semestre 2",
        type: "Profundizaci\u00f3n",
        credits: 10,
        subjects: [
          { id: "mqsubj6", title: "Metodolog\u00edas de desarrollo \u00e1giles",                 credits: 2, homologa: false },
          { id: "mqsubj7", title: "Mejoramiento de procesos de desarrollo",                     credits: 2, homologa: true  },
          { id: "mqsubj8", title: "Procesos de gesti\u00f3n de calidad de software",            credits: 2, homologa: true  },
          { id: "mqsubj9", title: "Lengua Extranjera Nivel B2.1",                               credits: 2, homologa: false },
          { id: "mqsubj10", title: "Ciencia, Tecnolog\u00eda e Innovaci\u00f3n",                 credits: 2, homologa: false },
        ]
      }
    ]
  },
  "id177491820947468q": {
    id: "lr-metodologias-calidad-sistemas",
    espId: "id177491820947468q",
    type: "especializacion",
    espName: "Esp. en Metodolog\u00edas de Calidad para el Desarrollo del Software",
    credits: 20,
    semesters: [
      {
        id: "sem1",
        title: "Semestre 1",
        type: "Fundamentaci\u00f3n",
        credits: 10,
        subjects: [
          { id: "mqsubj1", title: "Metodolog\u00edas de desarrollo tradicionales",             credits: 2, homologa: true  },
          { id: "mqsubj2", title: "Gesti\u00f3n de Proyectos de software",                      credits: 2, homologa: true  },
          { id: "mqsubj3", title: "Procesos de desarrollo de software",                         credits: 3, homologa: false },
          { id: "mqsubj4", title: "Estructura y arquitectura de software",                      credits: 1, homologa: true  },
          { id: "mqsubj5", title: "C\u00e1tedra Generaci\u00f3n Siglo 21",                       credits: 2, homologa: false },
        ]
      },
      {
        id: "sem2",
        title: "Semestre 2",
        type: "Profundizaci\u00f3n",
        credits: 10,
        subjects: [
          { id: "mqsubj6", title: "Metodolog\u00edas de desarrollo \u00e1giles",                 credits: 2, homologa: false },
          { id: "mqsubj7", title: "Mejoramiento de procesos de desarrollo",                     credits: 2, homologa: true  },
          { id: "mqsubj8", title: "Procesos de gesti\u00f3n de calidad de software",            credits: 2, homologa: true  },
          { id: "mqsubj9", title: "Lengua Extranjera Nivel B2.1",                               credits: 2, homologa: false },
          { id: "mqsubj10", title: "Ciencia, Tecnolog\u00eda e Innovaci\u00f3n",                 credits: 2, homologa: false },
        ]
      }
    ]
  },
  "id1774918209474vrm": {
    id: "lr-inteligencia-artificial",
    espId: "id1774918209474vrm",
    type: "especializacion",
    espName: "Especializaci\u00f3n en Inteligencia Artificial",
    credits: 20,
    semesters: [
      {
        id: "sem1",
        title: "Semestre 1",
        type: "Fundamentaci\u00f3n",
        credits: 10,
        subjects: [
          { id: "iasubj1", title: "Inteligencia Artificial - Fundamentos", credits: 2, homologa: true  },
          { id: "iasubj2", title: "Percepci\u00f3n Computacional",           credits: 2, homologa: false },
          { id: "iasubj3", title: "Introducci\u00f3n a Machine Learning",    credits: 3, homologa: false },
          { id: "iasubj4", title: "Deep Learning - Fundamentos",             credits: 2, homologa: true  },
          { id: "iasubj5", title: "C\u00e1tedra Generaci\u00f3n Siglo 21",   credits: 1, homologa: false },
        ]
      },
      {
        id: "sem2",
        title: "Semestre 2",
        type: "Profundizaci\u00f3n",
        credits: 10,
        subjects: [
          { id: "iasubj6", title: "Machine Learning y algoritmos gen\u00e9ticos",       credits: 2, homologa: true  },
          { id: "iasubj7", title: "Procesamiento de lenguaje natural",                  credits: 2, homologa: true  },
          { id: "iasubj8", title: "Aplicaciones en Deep Learning",                      credits: 2, homologa: true  },
          { id: "iasubj9", title: "Lengua extranjera en el nivel MCRE B2",              credits: 2, homologa: false },
          { id: "iasubj10", title: "Ciencia, Tecnolog\u00eda e Innovaci\u00f3n",        credits: 2, homologa: false },
        ]
      }
    ]
  },
  "id1774918209474rf4": {
    id: "lr-gerencia-financiera-contable",
    espId: "id1774918209474rf4",
    type: "especializacion",
    espName: "Especializaci\u00f3n en Gerencia Financiera y Contable",
    credits: 20,
    semesters: [
      {
        id: "sem1",
        title: "Semestre 1",
        type: "Fundamentaci\u00f3n",
        credits: 9,
        subjects: [
          { id: "gfsubj1", title: "CADI Legislaci\u00f3n Financiera",                                    credits: 2, homologa: false },
          { id: "gfsubj2", title: "CADI Contabilidad Avanzada",                                           credits: 2, homologa: true  },
          { id: "gfsubj3", title: "CADI Diagn\u00f3stico estrat\u00e9gico y Financiero",                  credits: 2, homologa: true  },
          { id: "gfsubj4", title: "CADI An\u00e1lisis y Administraci\u00f3n Financiera",                  credits: 2, homologa: true  },
          { id: "gfsubj5", title: "CAI Generaci\u00f3n Siglo XXI",                                       credits: 1, homologa: false },
        ]
      },
      {
        id: "sem2",
        title: "Semestre 2",
        type: "Profundizaci\u00f3n",
        credits: 11,
        subjects: [
          { id: "gfsubj6", title: "CADI Contexto Financiero Internacional",                               credits: 4, homologa: false },
          { id: "gfsubj7", title: "CADI Econometr\u00eda y Herramientas",                                 credits: 3, homologa: true  },
          { id: "gfsubj8", title: "CAI Lengua Extranjera B2.1",                                          credits: 2, homologa: false },
          { id: "gfsubj9", title: "CAI Ciencia Tecnolog\u00eda e Innovaci\u00f3n",                        credits: 2, homologa: false },
        ]
      }
    ]
  }
};
