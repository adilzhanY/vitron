use aws_config::meta::region::RegionProviderChain;
use aws_sdk_s3::primitives::ByteStream;
use aws_sdk_s3::Client;
use base64::engine::general_purpose::STANDARD as base64_standard;
use base64::Engine;
use chrono::Utc;
use serde_json::json;
use std::error::Error;

pub async fn upload_image(
    bucket: &str,
    user_id: &str,
    mode: Option<String>,
    image_name: Option<String>,
    image_base64: &str,
) -> Result<serde_json::Value, Box<dyn Error + Send + Sync>> {
    let bytes = base64_standard.decode(image_base64)?;

    let folder = match mode.as_deref() {
        Some("label") => "meal-labels",
        _ => "meal-images",
    };

    let prefix = match mode.as_deref() {
        Some("label") => "meal_label",
        _ => "meal_image",
    };

    let timestamp = Utc::now().timestamp_millis();
    let filename = match image_name {
        Some(name) => format!("{}_{}", prefix, name),
        None => format!("{}_{}_{}.jpg", prefix, user_id, timestamp),
    };

    let key = format!("{}/{}", folder, filename);

    // AWS config
    let region_provider = RegionProviderChain::default_provider().or_else("us-east-1");
    let region = region_provider
        .region()
        .await
        .map(|r| r.as_ref().to_string())
        .unwrap_or_else(|| "us-east-1".to_string());

    let config = aws_config::from_env().region(region_provider).load().await;
    let client = Client::new(&config);

    let body = ByteStream::from(bytes.clone());

    client
        .put_object()
        .bucket(bucket)
        .key(&key)
        .body(body)
        .content_type("image/jpeg")
        .send()
        .await?;

    let url = format!(
        "https://{}.s3.{}.amazonaws.com/{}",
        bucket,
        config.region().unwrap().as_ref(),
        key
    );

    Ok(json!({"success": true, "url": url, "key": key}))
}
