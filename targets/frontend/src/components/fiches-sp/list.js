import { useContext } from "react";
import { SelectionContext } from "src/pages/contenus/fiches-sp";
import { Label } from "theme-ui";

import { Li, List } from "../list";

export function ServicPublicList({ items }) {
  return (
    <List>
      {items.map((item) => (
        <Li key={item.id}>
          <ServicePublicItem item={item} />
        </Li>
      ))}
    </List>
  );
}

function ServicePublicItem({ item }) {
  const [selectedItems, setSelectedItems] = useContext(SelectionContext);

  function updateSelection(event) {
    if (event.target.checked) {
      setSelectedItems(selectedItems.concat(item.id));
    } else {
      setSelectedItems(selectedItems.filter((id) => item.id !== id));
    }
  }
  return (
    <Label>
      <input
        type="checkbox"
        defaultChecked={selectedItems.includes(item.id)}
        onChange={updateSelection}
      />
      {item.id} ({item.status})
    </Label>
  );
}
