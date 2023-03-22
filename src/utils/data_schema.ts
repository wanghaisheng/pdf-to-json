import { Schema, SchemaProperty } from '../types/schemaTypes';

export const sample_schema: Record<string, SchemaProperty> = {
  restaurant_name: {
    description: 'The name of the restaurant',
    type: 'string',
    example: 'The Fancy Diner',
  },
  restaurant_address: {
    description: 'The address of the restaurant',
    type: 'string',
    example: '123 Main Street, Cityville, State, 12345',
  },
  restaurant_phone: {
    description: 'The phone number of the restaurant',
    type: 'string',
    example: '(123) 456-7890',
  },
  food_type: {
    description: 'The type of food served at the restaurant',
    type: 'string',
    example: 'American',
  },
  // menu_items: {
  //   description: 'All of the food items on the mnenu.',
  //   type: 'array',
  //   items: {
  //     name: {
  //       description: 'The title of the menu item',
  //       type: 'string',
  //       example: 'The Classic Burger',
  //     },
  //     price: {
  //       description: 'The price of the menu item',
  //       type: 'string',
  //       example: '$10',
  //     },
  //   },
  // },
  menu_price_range: {
    description:
      'The price range of the restaurant expressed as $, $$, $$$, or $$$$',
    type: 'string',
    example: '$$',
  },
};
