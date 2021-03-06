import lowGet from "lodash.get";
import PropTypes from "prop-types";
import { useFieldArray } from "react-hook-form";
import { IoMdAdd } from "react-icons/io";
import { SortableContainer } from "react-sortable-hoc";
import { Button } from "src/components/button";
import { List } from "src/components/list";

import { SortableSection, TYPES } from "./Section";

const SortableSectionList = SortableContainer(
  ({ blocks, errors, name, ...props }) => (
    <List>
      {blocks.map((block, index) => (
        <SortableSection
          {...props}
          numberOfBlocks={blocks.length}
          key={block.key}
          block={block}
          errors={lowGet(errors, `${name}.${index}`)}
          index={index}
          name={`${name}.${index}`}
          // index is not provided to children due to a bug
          blockIndex={index}
        />
      ))}
    </List>
  )
);

export function ContentSections({ control, name, register, errors }) {
  const {
    fields: blocks,
    append,
    move,
    remove,
  } = useFieldArray({
    control,
    keyName: "key",
    name,
  });

  return (
    <div>
      <SortableSectionList
        blocks={blocks}
        control={control}
        errors={errors}
        lockAxis="y"
        name={name}
        register={register}
        remove={remove}
        useDragHandle
        onSortEnd={({ oldIndex, newIndex }) => {
          if (oldIndex === newIndex) {
            return;
          }
          move(oldIndex, newIndex);
        }}
      />
      <Button
        mb="medium"
        type="button"
        size="small"
        variant="secondary"
        onClick={() => append({ type: TYPES.MARKDOWN })}
      >
        {/* todo refactor to a ButtonWithicon since sx props not working */}
        <IoMdAdd
          sx={{
            height: "iconSmall",
            mr: "xsmall",
            width: "iconSmall",
          }}
        />
        Ajouter une section supplémentaire
      </Button>
    </div>
  );
}

ContentSections.propTypes = {
  control: PropTypes.object.isRequired,
  errors: PropTypes.object,
  name: PropTypes.string.isRequired,
  register: PropTypes.func.isRequired,
};
