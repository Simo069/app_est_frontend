import type { DocumentResource, ModuleResourceCounts } from '../types/resource';

export const mockResourcesByModule: Record<string, DocumentResource[]> = {
    // Default fallback or key by module code / id
    'default': [
        // COURS (3)
        {
            id: 'c1',
            moduleId: 'm101',
            title: "Chapitre 1 — Introduction à l'algorithmique",
            type: 'COURS',
            format: 'PDF',
            size: '1.2 MB',
            addedDate: 'Ajouté 12 Sept.',
            pagesCount: 12,
            requiresAuth: false,
            previewContent: {
                chapterTitle: "Chapitre 1 — Introduction à l'algorithmique",
                sections: [
                    {
                        heading: "1. Notions d'algorithme et de programme",
                        text: "Un algorithme est une suite finie et non ambiguë d'instructions permettant de résoudre un problème donné. Il constitue la base conceptuelle avant toute écriture de code source.",
                        bullets: [
                            "Enchaînement logique d'instructions simples",
                            "Déterminisme : même entrée = même résultat",
                            "Finitude : l'exécution doit se terminer en un temps fini"
                        ]
                    },
                    {
                        heading: "2. Structure générale d'un algorithme",
                        text: "Chaque algorithme comporte une entête, une déclaration des variables et un corps délimité par Début et Fin.",
                        codeSnippet: `Algorithme SommeDeuxNombres
Variables
   a, b, somme : Entier
Début
   Ecrire("Entrer la valeur de a : ")
   Lire(a)
   Ecrire("Entrer la valeur de b : ")
   Lire(b)
   somme <- a + b
   Ecrire("La somme est : ", somme)
Fin`
                    },
                    {
                        heading: "3. Types de données fondamentaux",
                        text: "Les types de base manipulés en algorithmique comprennent les Entiers, Réels, Caractères, Chaînes et Booléens."
                    }
                ]
            }
        },
        {
            id: 'c2',
            moduleId: 'm101',
            title: "Chapitre 2 — Structures conditionnelles",
            type: 'COURS',
            format: 'PDF',
            size: '0.9 MB',
            addedDate: 'Ajouté 19 Sept.',
            pagesCount: 16,
            requiresAuth: false,
            previewContent: {
                chapterTitle: "Chapitre 2 — Structures conditionnelles",
                sections: [
                    {
                        heading: "1. La structure Si ... Alors ... Sinon",
                        text: "Permet de conditionner l'exécution d'un bloc d'instructions à la vérification d'une expression booléenne.",
                        codeSnippet: `Si (note >= 10) Alors
   Ecrire("Module validé")
Sinon
   Ecrire("Rattrapage")
Finsi`
                    },
                    {
                        heading: "2. La structure Selon Que (Switch/Case)",
                        text: "Permet de choisir une branche parmi plusieurs choix possibles en fonction de la valeur d'une variable."
                    }
                ]
            }
        },
        {
            id: 'c3',
            moduleId: 'm101',
            title: "Chapitre 3 — Boucles et itérations (slides)",
            type: 'COURS',
            format: 'PPT',
            size: '3.4 MB',
            addedDate: 'Ajouté 26 Sept.',
            pagesCount: 24,
            requiresAuth: true,
            previewContent: {
                chapterTitle: "Chapitre 3 — Boucles et itérations",
                sections: [
                    {
                        heading: "1. Présentation des structures répétitives",
                        text: "Les itérations permettent de répéter une séquence d'instructions un nombre déterminé ou conditionnel de fois.",
                        bullets: [
                            "Boucle Pour : nombre d'itérations connu à l'avance",
                            "Boucle Tant Que : condition évaluée au début",
                            "Boucle Répéter ... Jusqu'à : condition évaluée à la fin"
                        ]
                    }
                ]
            }
        },

        // TD (4)
        {
            id: 'td1',
            moduleId: 'm101',
            title: "TD 1 — Algorithmes simples & Variables",
            type: 'TD',
            format: 'PDF',
            size: '0.8 MB',
            addedDate: 'Ajouté 14 Sept.',
            pagesCount: 4,
            requiresAuth: false,
            previewContent: {
                chapterTitle: "Fiche TD n°1 : Manipulations de variables",
                sections: [
                    {
                        heading: "Exercice 1 : Échange de deux valeurs",
                        text: "Écrire un algorithme qui permet d'échanger le contenu de deux variables a et b saisies par l'utilisateur.",
                        codeSnippet: `// Solution Exercice 1
temp <- a
a <- b
b <- temp`
                    },
                    {
                        heading: "Exercice 2 : Calcul de surface",
                        text: "Calculer la surface d'un cercle à partir de son rayon r fourni au clavier."
                    }
                ]
            }
        },
        {
            id: 'td2',
            moduleId: 'm101',
            title: "TD 2 — Structures de choix Si / Sinon",
            type: 'TD',
            format: 'PDF',
            size: '1.1 MB',
            addedDate: 'Ajouté 21 Sept.',
            pagesCount: 5,
            requiresAuth: false,
            previewContent: {
                chapterTitle: "Fiche TD n°2 : Les structures conditionnelles",
                sections: [
                    {
                        heading: "Exercice 1 : Résolution de l'équation ax + b = 0",
                        text: "Écrire un algorithme complet prenant en entrée a et b et affichant la solution exacte."
                    }
                ]
            }
        },
        {
            id: 'td3',
            moduleId: 'm101',
            title: "TD 3 — Boucles Pour, Tant que et Répéter",
            type: 'TD',
            format: 'PDF',
            size: '1.4 MB',
            addedDate: 'Ajouté 28 Sept.',
            pagesCount: 6,
            requiresAuth: false,
            previewContent: {
                chapterTitle: "Fiche TD n°3 : Les structures itératives",
                sections: [
                    {
                        heading: "Exercice 1 : Calcul de la factorielle n!",
                        text: "Écrire un algorithme qui calcule et affiche la factorielle d'un nombre entier naturel n."
                    }
                ]
            }
        },
        {
            id: 'td4',
            moduleId: 'm101',
            title: "TD 4 — Tableaux et Matrices",
            type: 'TD',
            format: 'PDF',
            size: '1.8 MB',
            addedDate: 'Ajouté 05 Oct.',
            pagesCount: 8,
            requiresAuth: true,
            previewContent: {
                chapterTitle: "Fiche TD n°4 : Tableaux à une et deux dimensions",
                sections: [
                    {
                        heading: "Exercice 1 : Recherche du maximum dans un tableau",
                        text: "Remplir un tableau de N éléments réels et rechercher la valeur maximale ainsi que son indice."
                    }
                ]
            }
        },

        // TP (3)
        {
            id: 'tp1',
            moduleId: 'm101',
            title: "TP 1 — Prise en main de l'environnement C",
            type: 'TP',
            format: 'PDF',
            size: '1.5 MB',
            addedDate: 'Ajouté 16 Sept.',
            pagesCount: 8,
            requiresAuth: false,
            previewContent: {
                chapterTitle: "TP n°1 : Prise en main de GCC / Code::Blocks",
                sections: [
                    {
                        heading: "Objectifs du TP",
                        text: "Se familiariser avec la création d'un projet en langage C, la compilation et le débogage.",
                        codeSnippet: `#include <stdio.stdio.h>

int main() {
    printf("Bonjour EST Casablanca!\\n");
    return 0;
}`
                    }
                ]
            }
        },
        {
            id: 'tp2',
            moduleId: 'm101',
            title: "TP 2 — Implémentation des conditions et boucles",
            type: 'TP',
            format: 'PDF',
            size: '2.1 MB',
            addedDate: 'Ajouté 23 Sept.',
            pagesCount: 10,
            requiresAuth: false,
            previewContent: {
                chapterTitle: "TP n°2 : Structures de contrôle en C",
                sections: [
                    {
                        heading: "Sujet : Jeu du nombre mystère",
                        text: "Écrire un programme C qui génère un nombre aléatoire entre 1 et 100 et demande à l'utilisateur de le deviner."
                    }
                ]
            }
        },
        {
            id: 'tp3',
            moduleId: 'm101',
            title: "TP 3 — Mini-projet : Gestion d'inventaire",
            type: 'TP',
            format: 'PDF',
            size: '2.8 MB',
            addedDate: 'Ajouté 12 Oct.',
            pagesCount: 14,
            requiresAuth: true,
            previewContent: {
                chapterTitle: "TP n°3 : Mini-projet d'inventaire",
                sections: [
                    {
                        heading: "Cahier des charges",
                        text: "Concevoir une application console permettant l'ajout, la suppression et le tri d'un stock de produits."
                    }
                ]
            }
        }
    ]
};

// Helper function to get resources for a module or fallback
export function getResourcesForModule(moduleId?: string): DocumentResource[] {
    if (moduleId && mockResourcesByModule[moduleId]) {
        return mockResourcesByModule[moduleId];
    }
    return mockResourcesByModule['default'];
}

// Helper function to calculate counts
export function calculateResourceCounts(resources: DocumentResource[]): ModuleResourceCounts {
    const cours = resources.filter(r => r.type === 'COURS').length;
    const td = resources.filter(r => r.type === 'TD').length;
    const tp = resources.filter(r => r.type === 'TP').length;
    const examens = resources.filter(r => r.type === 'EXAMENS').length;
    return {
        total: resources.length,
        cours,
        td,
        tp,
        examens
    };
}
