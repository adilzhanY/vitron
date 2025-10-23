use lambda_http::{run, service_fn, Body, Error, Request, Response};
use serde::{Deserialize, Serialize};
use std::env;

mod s3;

#[derive(Deserialize)]
struct S3UploadRequest {
    #[serde(alias = "imageDataBase64")]
    image_data_base64: String,
    #[serde(alias = "userId")]
    user_id: String,
    mode: Option<String>,
    #[serde(alias = "imageName")]
    image_name: Option<String>,
}

#[derive(Serialize)]
struct ErrorResponse {
    error: String,
}

async fn function_handler(event: Request) -> Result<Response<Body>, Error> {
    let bucket =
        env::var("S3_BUCKET").map_err(|_| Error::from("S3_BUCKET environment variable not set"))?;

    let body = event.body();
    let req: S3UploadRequest = serde_json::from_slice(body.as_ref())?;

    // Upload to S3
    match s3::upload_image(
        &bucket,
        &req.user_id,
        req.mode,
        req.image_name,
        &req.image_data_base64,
    )
    .await
    {
        Ok(resp) => {
            let response = Response::builder()
                .status(200)
                .header("content-type", "application/json")
                .body(Body::from(serde_json::to_string(&resp)?))
                .map_err(Box::new)?;
            Ok(response)
        }
        Err(e) => {
            eprintln!("Error uploading to S3: {}", e);
            let error_resp = ErrorResponse {
                error: e.to_string(),
            };
            let response = Response::builder()
                .status(500)
                .header("content-type", "application/json")
                .body(Body::from(serde_json::to_string(&error_resp)?))
                .map_err(Box::new)?;
            Ok(response)
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
