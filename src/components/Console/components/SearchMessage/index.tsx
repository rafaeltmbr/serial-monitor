import React from "react";
import { LogType, logTypeCategoryName } from "../../../../interfaces/Log/ILog";
import { Container, Highlight } from "./styles";

interface IProps {
  search: string;
  selectedType: LogType | undefined;
}

export const SearchMessage: React.FC<IProps> = ({ search, selectedType }) => {
  return (
    <Container>
      {search && (
        <>
          Showing results matching <Highlight>{search}</Highlight>
        </>
      )}
      {selectedType &&
        (search ? (
          <>
            {" "}
            in <Highlight>{logTypeCategoryName[selectedType]}</Highlight>{" "}
            category
          </>
        ) : (
          <>
            Showing results in{" "}
            <Highlight>{logTypeCategoryName[selectedType]}</Highlight> category
          </>
        ))}
    </Container>
  );
};
