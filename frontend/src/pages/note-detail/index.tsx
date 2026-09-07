import { useParams } from "react-router-dom";

export function NoteDetail() {
  const { id } = useParams();
  return <h1>Note {id}</h1>;
}
