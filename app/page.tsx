import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

export default function Home() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">API Documentation</h1>
      <SwaggerUI url="/swagger.json" />
    </div>
  );
}
