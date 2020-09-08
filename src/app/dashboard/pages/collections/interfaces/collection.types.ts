export enum AttributeType {
  String = 'string',
  Number = 'number',
}

export interface AttributeString {
  pattern: string | RegExp;
  minLength?: number;
  maxLength?: number;
}

export interface CreateAttributeModalResponseBase {
  name: string;
  required?: boolean;
}

export interface AttributeModalString extends CreateAttributeModalResponseBase {
  type: AttributeType.String;
  attribute: AttributeString;
}

export type CreateAttributeModalResponse = AttributeModalString;
