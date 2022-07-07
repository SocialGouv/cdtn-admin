import lowGet from "lodash.get";
import PropTypes from "prop-types";
import React from "react";
import { useFieldArray } from "react-hook-form";
import { IoMdAdd } from "react-icons/io";
import { SortableContainer } from "react-sortable-hoc";

import { Button } from "../button";
import { List } from "../list";
import { SortableSection } from "./Section";

const SortableSectionList = SortableContainer(
  ({ blocks, errors, name, ...props }: any) => (
    <List>
      {blocks.map((block: any, index: number) => (
        // @ts-ignore
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

export function ContentSections({ control, name, register, errors }: any) {
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
      {/*
      // @ts-ignore */}
      <SortableSectionList
        blocks={blocks}
        control={control}
        errors={errors}
        lockAxis="y"
        name={name}
        register={register}
        remove={remove}
        useDragHandle
        onSortEnd={({
          oldIndex,
          newIndex,
        }: {
          oldIndex: number;
          newIndex: number;
        }) => {
          if (oldIndex === newIndex) {
            return;
          }
          move(oldIndex, newIndex);
        }}
      />
      <Button
        size="small"
        variant="secondary"
        onClick={() => append({ type: "markdown" })}
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
