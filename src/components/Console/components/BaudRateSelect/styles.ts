import styled from "styled-components";

export const Container = styled.div`
  --animation-duration: 0.25s;

  height: 2rem;
  padding: 0 0.5rem;
  cursor: pointer;
  user-select: none;
  position: relative;

  display: flex;
  align-items: center;
`;

export const Label = styled.span`
  color: ${(props) => props.theme.colors.managementBarText};
  font-size: 0.875rem;
  line-height: 1em;
  white-space: nowrap;
`;

export const ArrowDown = styled.span`
  margin-left: 0.25rem;
  color: ${(props) => props.theme.colors.icon};
  line-height: 1em;
  transition-duration: var(--animation-duration);

  display: flex;
  align-items: center;
  justify-content: center;

  &[data-rotate="true"] {
    transform: rotateZ(180deg);
  }
`;

export const OptionsMask = styled.div`
  --options-top-position: 2rem;

  cursor: default;
  z-index: 2;
  opacity: 0;
  pointer-events: none;
  transition-duration: var(--animation-duration);

  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;

  &[data-show="true"] {
    --options-top-position: 2.5rem;

    opacity: 1;
    pointer-events: all;
  }
`;

export const OptionsListWrapper = styled.div`
  border-radius: 0.25rem;
  box-shadow: 0 0 0.5rem rgba(0, 0, 0, 0.25);
  background-color: ${(props) => props.theme.colors.logBackground};
  padding: 0.5rem 0;
  transition-duration: var(--animation-duration);

  position: absolute;
  top: var(--options-top-position);
  right: 0.5rem;
`;

export const OptionsList = styled.ul`
  max-height: calc(100vh - 4rem);
  overflow: hidden auto;
`;

export const Option = styled.li`
  list-style: none;
  padding: 0.25rem 1rem;
  transition-duration: color var(--animation-duration);
  cursor: pointer;

  display: flex;
  align-items: center;

  &:hover {
    background-color: ${(props) => props.theme.colors.baudOptionHover};
  }
`;

export const OptionText = styled.span`
  color: ${(props) => props.theme.colors.logText};
  font-size: 0.875rem;
  line-height: 1em;
  margin-right: 1rem;
`;

export const OptionIcon = styled.span`
  font-size: 1rem;
  line-height: 1em;
  color: ${(props) => props.theme.colors.icon};
  margin-right: 0.5rem;

  display: flex;
  align-items: center;
  justify-content: center;

  &[data-selected="false"] {
    opacity: 0;
  }
`;
