import type { CipherRule, CipherStage } from "@/types/cipher";

export function normalizeCipherAnswer(input: string): string {
  return input
    .trim()
    .toUpperCase()
    .replace(/\s+/g, " ");
}

export function validateCipherAnswer(input: string, stage: CipherStage): boolean {
  return normalizeCipherAnswer(input) === normalizeCipherAnswer(stage.solution);
}

export function applyCaesar(text: string, shift: number, decode: boolean): string {
  const direction = decode ? -shift : shift;
  return text.replace(/[A-Za-z]/g, (char) => {
    const base = char <= "Z" ? 65 : 97;
    const code = char.charCodeAt(0);
    const offset = ((code - base + direction) % 26 + 26) % 26;
    return String.fromCharCode(base + offset);
  });
}

export function applyReverseWords(text: string): string {
  return text.split(" ").reverse().join(" ");
}

export function applySymbolSubstitution(text: string, map: Record<string, string>, decode: boolean): string {
  if (decode) {
    const reverse = Object.fromEntries(Object.entries(map).map(([symbol, letter]) => [letter, symbol]));
    return text.replace(/[A-Za-z0-9@#]/g, (char) => reverse[char.toUpperCase()] ?? char);
  }
  return text.replace(/[A-Za-z]/g, (char) => {
    const upper = char.toUpperCase();
    return map[upper] ?? char;
  });
}

export function applyCipherRule(text: string, rule: CipherRule, decode: boolean): string {
  switch (rule.type) {
    case "caesar":
      return applyCaesar(text, rule.shift ?? 0, decode);
    case "reverse-words":
      return applyReverseWords(text);
    case "symbol-substitution":
      return applySymbolSubstitution(text, rule.map ?? {}, decode);
    default:
      return text;
  }
}

/** Decode encrypted text using stage rules (inverse order for mixed ciphers). */
export function decodeCipherText(stage: CipherStage): string {
  if (stage.cipherType === "caesar") {
    return applyCaesar(stage.encryptedText, stage.shift ?? 0, true);
  }
  if (stage.cipherType === "reverse-words") {
    return applyReverseWords(stage.encryptedText);
  }
  if (stage.cipherType === "symbol-substitution") {
    return applySymbolSubstitution(stage.encryptedText, stage.map ?? {}, true);
  }
  if (stage.cipherType === "mixed" && stage.rules) {
    let result = stage.encryptedText;
    const rules = [...stage.rules].reverse();
    for (const rule of rules) {
      result = applyCipherRule(result, rule, true);
    }
    return result;
  }
  return stage.encryptedText;
}
