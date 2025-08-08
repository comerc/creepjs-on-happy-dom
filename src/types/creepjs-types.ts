/**
 * CreepJS specific types and interfaces
 */

export interface CreepJSTest {
  name: string;
  execute(): Promise<any>;
  validate(result: any): boolean;
}

export interface CreepJSTestSuite {
  tests: CreepJSTest[];
  run(): Promise<any>; // Will use CreepJSResults from emulation-types
}

// CreepJSResults is already defined in emulation-types.ts
// This file contains CreepJS-specific interfaces that don't duplicate