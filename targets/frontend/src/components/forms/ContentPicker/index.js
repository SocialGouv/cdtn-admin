import PropTypes from "prop-types";
import { Controller } from "react-hook-form";

import { ContentSearch } from "./ContentSearch";
import { SortableList } from "./SortableList";

const ContentPicker = ({ defaultValue, disabled, full, ...props }) => {
  return (
    <Controller
      {...props}
      defaultValue={defaultValue}
      // eslint-disable-next-line no-unused-vars
      render={({ field }) => (
        <RootContentPicker disabled={disabled} {...field} full={full} />
      )}
    />
  );
};

ContentPicker.propTypes = {
  defaultValue: PropTypes.array,
  disabled: PropTypes.bool,
};

export { ContentPicker };

const RootContentPicker = ({ disabled, value: contents = [], onChange }) => {
  const onDeleteContent = (cdtnId) => {
    onChange(contents.filter((content) => content.cdtnId !== cdtnId));
  };

  return (
    <>
      <SortableList
        contents={contents}
        useDragHandle={true}
        lockAxis="y"
        onSortEnd={({ oldIndex, newIndex }) => {
          const contentsCopy = [...contents];
          contentsCopy.splice(newIndex, 0, contentsCopy.splice(oldIndex, 1)[0]);
          onChange(contentsCopy);
        }}
        onDeleteContent={onDeleteContent}
      />
      {!disabled && <ContentSearch onChange={onChange} contents={contents} />}
    </>
  );
};

RootContentPicker.propTypes = {
  disabled: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.array,
};
