import { useParams } from "@remix-run/react";

export default function ShowPage() {
  const params = useParams();

  return (
    <iframe
      title={`${params.hood}:${params.address}`}
      src={`/${params.hood}/${params.address}/${params.page}?raw=true`}
      width="100%"
      height="100%"
    ></iframe>
  );
}
