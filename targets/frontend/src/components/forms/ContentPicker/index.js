/** @jsx jsx  */

import PropTypes from "prop-types";
import { Controller } from "react-hook-form";
import { useUser } from "src/hooks/useUser";
import { jsx } from "theme-ui";

import { ContentList } from "./ContentList";
import { ContentSearch } from "./ContentSearch";

const ContentPicker = ({ defaultValue, disabled, ...props }) => {
  return (
    <Controller
      {...props}
      defaultValue={defaultValue}
      render={(props) => <RootContentPicker disabled={disabled} {...props} />}
    />
  );
};

ContentPicker.propTypes = {
  defaultValue: PropTypes.array,
  disabled: PropTypes.bool,
};

export { ContentPicker };

function RootContentPicker({ disabled, value: contents = [], onChange }) {
  const { isAdmin } = useUser();

  const onDeleteContent = (cdtnId) => {
    onChange(contents.filter((content) => content.cdtnId !== cdtnId));
  };

  return (
    <>
      <ContentList
        contents={contents}
        isAdmin={isAdmin}
        useDragHandle={true}
        lockAxis="y"
        onSortEnd={({ oldIndex, newIndex }) => {
          const contentsCopy = [...contents];
          contentsCopy.splice(newIndex, 0, contentsCopy.splice(oldIndex, 1)[0]);
          onChange(contentsCopy);
        }}
        onDeleteContent={onDeleteContent}
      />
      {!disabled && (
        <ContentSearch
          onChange={onChange}
          contents={contents}
          isAdmin={isAdmin}
        />
      )}
    </>
  );
}

RootContentPicker.propTypes = {
  disabled: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.array,
};
