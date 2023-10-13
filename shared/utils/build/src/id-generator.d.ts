export declare const MAX_ID_LENGTH = 10;
export declare const generateCdtnId: (content: string, maxIdLength?: number) => string;
export declare const generateInitialId: () => string;
export declare const generateIds: (source: string, maxIdLength?: number) => {
    cdtn_id: string;
    initial_id: string;
};
//# sourceMappingURL=id-generator.d.ts.map