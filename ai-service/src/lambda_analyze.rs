use lambda_http::{run, service_fn, Body, Error, Request, Response};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::env;

mod ai;

#[derive(Deserialize)]
struct AiRequest {
    #[serde(alias = "imageUrl")]
    image_url: String,
    prompt: Option<String>,
}

#[derive(Serialize)]
struct ErrorResponse {
    error: String,
}

async fn function_handler(event: Request) -> Result<Response<Body>, Error> {
    let api_key = env::var("OPENROUTER_API_KEY")
        .map_err(|_| Error::from("OPENROUTER_API_KEY environment variable not set"))?;

    let body = event.body();
    let req: AiRequest = serde_json::from_slice(body.as_ref())?;

    match ai::analyze_image(&req.image_url, req.prompt, api_key).await {
        Ok(json) => {
            let resp = Response::builder()
                .status(200)
                .header("content-type", "application/json")
                .body(Body::from(serde_json::to_string(&json)?))
                .map_err(Box::new)?;
            Ok(resp)
        }
        Err(e) => {
            eprintln!("Error analyzing image: {}", e);
            let error_resp = ErrorResponse {
                error: e.to_string(),
            };
            let resp = Response::builder()
                .status(500)
                .header("content-type", "application/json")
                .body(Body::from(serde_json::to_string(&error_resp)?))
                .map_err(Box::new)?;
            Ok(resp)
        }
    }
}

#[tokio::main]
async fn main() -> Result<(), Error> {
    tracing_subscriber::fmt()
        .with_max_level(tracing::Level::INFO)
        .with_target(false)
        .without_time()
        .init();

    run(service_fn(function_handler)).await
}
