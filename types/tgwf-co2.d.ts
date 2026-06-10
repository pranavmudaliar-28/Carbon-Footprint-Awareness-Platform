/**
 * Minimal type declarations for @tgwf/co2 (CO2.js) — the package ships no types.
 * Only the surface Verda uses (the SWD `co2` model's `perByte`) is declared.
 */
declare module '@tgwf/co2' {
  export interface Co2Options {
    model?: 'swd' | '1byte';
    version?: number;
    rating?: boolean;
  }

  export class co2 {
    constructor(options?: Co2Options);
    /** Estimated grams CO₂e for a number of bytes transferred. */
    perByte(bytes: number, green?: boolean): number;
    /** Estimated grams CO₂e for a full visit (with caching assumptions). */
    perVisit(bytes: number, green?: boolean): number;
  }

  export class hosting {
    check(domain: string | string[]): Promise<unknown>;
  }
}
