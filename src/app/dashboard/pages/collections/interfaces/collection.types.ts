export enum AttributeType {
  String = 'string',
  Number = 'number',
  Integer = 'integer',
}

export interface AttributesString {
  pattern: string | RegExp;
  minLength?: number;
  maxLength?: number;
}

export interface AttributesNumber {
  minimum?: number;
  maximum?: number;
}

export interface CreateAttributeModalResponseBase {
  name: string;
  isRequired?: boolean;
}

export interface AttributeModalString extends CreateAttributeModalResponseBase {
  type: AttributeType.String;
  attributes: AttributesString;
}

export interface AttributeModalNumber extends CreateAttributeModalResponseBase {
  type: AttributeType.Number;
  attributes: AttributesNumber;
}

export type CreateAttributeModalResponse =
  | AttributeModalString
  | AttributeModalNumber;


export interface PublicKeyFormItem {
  publicKey: string;
}
