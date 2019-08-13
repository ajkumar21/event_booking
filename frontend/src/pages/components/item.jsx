import React from 'react';
import { Item } from 'semantic-ui-react';

const ItemExampleItems = props => (
  <Item>
    <Item.Content>
      <Item.Header as='a'>{props.title}</Item.Header>
      <Item.Meta>{props.date}</Item.Meta>
      <Item.Meta>{props.price}</Item.Meta>
      <Item.Description>{props.description}</Item.Description>
    </Item.Content>
  </Item>
);

export default ItemExampleItems;
