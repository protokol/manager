import { AttributeType } from '@app/dashboard/pages/collections/interfaces/collection.types';

export abstract class CollectionsUtils {
  static getDefaultJsonSchema() {
    return {
      type: 'object',
      properties: {},
      required: [],
    };
  }

  static getAttributeTypes(): AttributeType[] {
    return [AttributeType.String, AttributeType.Number, AttributeType.Integer];
  }
}
