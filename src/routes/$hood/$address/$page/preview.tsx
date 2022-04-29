import { useParams } from "@remix-run/react";

export default function ShowPage() {
  const params = useParams();

  return (
    <div>
      <iframe
        title={`${params.hood}:${params.address}`}
        src={`/${params.hood}/${params.address}/${params.page}?raw=true`}
      ></iframe>
    </div>
  );
}
