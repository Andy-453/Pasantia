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
          { id: "subj1", title: "Econom\u00eda rural y pol\u00edtica p\u00fablica",             credits: 2, homologa: false },
          { id: "subj2", title: "Modelos de producci\u00f3n agropecuarios",                  credits: 2, homologa: false },
          { id: "subj3", title: "Gesti\u00f3n ambiental y territorio",                        credits: 3, homologa: true  },
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
          { id: "subj6", title: "Seguridad alimentaria y cultivos andinos",                   credits: 3, homologa: false },
          { id: "subj7", title: "Sistemas de producci\u00f3n ecol\u00f3gicos",                credits: 2, homologa: false },
          { id: "subj8", title: "Ciencia Tecnolog\u00eda e Innovaci\u00f3n",                  credits: 2, homologa: true  },
          { id: "subj9", title: "Agroecoturismo",                                             credits: 3, homologa: false },
        ]
      }
    ]
  }
};
