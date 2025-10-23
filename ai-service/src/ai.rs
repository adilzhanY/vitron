use reqwest::Client;
use serde_json::Value;
use std::error::Error;

pub async fn analyze_image(
    image_url: &str,
    prompt: Option<String>,
    api_key: String,
) -> Result<Value, Box<dyn Error + Send + Sync>> {
    let prompt_text = prompt
        .unwrap_or_else(|| "Please analyze this image and estimate macros/calories.".to_string());

    let payload = serde_json::json!({
        "model": "openai/gpt-4.1-nano",
        "messages": [
            {
                "role": "user",
                "content": [
                    {"type":"text", "text": prompt_text},
                    {"type":"image_url","image_url": {"url": image_url}}
                ]
            }
        ]
    });

    let client = Client::new();
    let res = client
        .post("https://openrouter.ai/api/v1/chat/completions")
        .bearer_auth(api_key)
        .json(&payload)
        .send()
        .await?;

    let status = res.status();
    let text = res.text().await?;
    if !status.is_success() {
        let err = format!("OpenRouter responded with {}: {}", status, text);
        return Err(err.into());
    }

    let json: Value = serde_json::from_str(&text)?;
    Ok(json)
}
