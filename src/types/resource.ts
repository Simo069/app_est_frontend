export type ResourceType = 'COURS' | 'TD' | 'TP' | 'EXAMENS';
export type FileFormat = 'PDF' | 'PPT' | 'DOCX';

export interface DocumentResource {
    id: string;
    moduleId: string;
    title: string;
    type: ResourceType;
    format: FileFormat;
    size: string;
    addedDate: string;
    pagesCount?: number;
    requiresAuth?: boolean;
    isOfficial?: boolean;
    downloadUrl?: string;
    previewContent?: {
        chapterTitle: string;
        sections: {
            heading: string;
            text: string;
            bullets?: string[];
            codeSnippet?: string;
        }[];
    };
}

export interface ModuleResourceCounts {
    total: number;
    cours: number;
    td: number;
    tp: number;
    examens: number;
}