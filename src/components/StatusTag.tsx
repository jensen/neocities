import classnames from "classnames";

export default function StatusTag(props) {
  return (
    <article
      className={classnames("status-tag status-tag--offset", {
        "status-tag--available": props.available,
        "status-tag--claimed": !props.available,
      })}
    >
      {props.available ? "Available" : "Claimed"}
    </article>
  );
}
