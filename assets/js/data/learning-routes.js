/**
 * learning-routes.js — Rutas de aprendizaje para especializaciones
 *
 * Estructura: { [espId]: { id, espId, espName, credits, semesters[] } }
 * Lookup O(1) por espId.
 *
 * Datos del pensum: Universidad de Cundinamarca — Res. No.023930 del 12/12/2023 MEN
 * Fuente: https://www.ucundinamarca.edu.co/index.php/posgrado/especializaciones/agroecologia-y-desarrollo-agroecoturistico
 */
window.__LEARNING_ROUTES = {
  "id17749182094742u1": {
    id: "lr-agroeco",
    espId: "id17749182094742u1",
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
  }
};
