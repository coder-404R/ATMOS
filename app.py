import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import dotenv_values

# Explicit path to .env file in project root
ENV_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env')

app = Flask(__name__)
CORS(app)  # Enable CORS for local frontend communication


def get_ai_clients():
    """Dynamically read .env values from disk."""
    config = dotenv_values(ENV_PATH)
    
    groq_key = (config.get("GROQ_API_KEY") or os.getenv("GROQ_API_KEY") or "").strip()
    if "gsk_" in groq_key and not groq_key.startswith("gsk_"):
        groq_key = groq_key[groq_key.index("gsk_"):]
    
    gemini_key = (config.get("GEMINI_API_KEY") or os.getenv("GEMINI_API_KEY") or "").strip()

    groq_client = None
    if groq_key and not groq_key.startswith("YOUR_GROQ"):
        try:
            from groq import Groq
            groq_client = Groq(api_key=groq_key)
            print("[OK] Groq API Client initialized successfully.")
        except Exception as e:
            print(f"[WARN] Error initializing Groq Client: {e}")

    genai_client = None
    if gemini_key and not gemini_key.startswith("YOUR_GEMINI"):
        try:
            from google import genai
            genai_client = genai.Client(api_key=gemini_key)
            print("[OK] Gemini GenAI Client initialized successfully.")
        except Exception as e:
            print(f"[WARN] Error initializing Gemini Client: {e}")

    return groq_client, genai_client


@app.route('/api/ai/status', methods=['GET'])
def get_status():
    """Return backend status without exposing secret API keys."""
    groq_client, genai_client = get_ai_clients()
    is_groq = groq_client is not None
    is_gemini = genai_client is not None
    is_ready = is_groq or is_gemini
    
    active_provider = "Groq AI" if is_groq else ("Gemini" if is_gemini else "None")
    
    return jsonify({
        "available": is_ready,
        "provider": active_provider,
        "status": "connected" if is_ready else "unconfigured",
        "message": f"Live AI Connected ({active_provider})" if is_ready else "Set GROQ_API_KEY or GEMINI_API_KEY in .env"
    })


@app.route('/api/ai/chat', methods=['POST'])
def chat():
    """Handle conversational weather query via Groq API (or Gemini API fallback)."""
    try:
        data = request.get_json() or {}
        user_message = data.get("message", "").strip()
        conversation = data.get("conversation", [])
        weather_context = data.get("weatherContext", {})
        unit = data.get("unit", "Celsius")

        if not user_message:
            return jsonify({
                "success": False,
                "error": "Empty message provided."
            }), 400

        groq_client, genai_client = get_ai_clients()

        # Verify AI client readiness
        if not groq_client and not genai_client:
            return jsonify({
                "success": False,
                "error": "Atmos AI is currently unconfigured. Please add your GROQ_API_KEY or GEMINI_API_KEY to .env.",
                "fallback": generate_offline_fallback(user_message, weather_context)
            }), 200

        # Construct System Instruction with real-time weather context
        system_instruction = f"""You are Atmos AI, the intelligent weather assistant inside the Atmos weather application.
Your job is to help users understand their weather and make practical decisions using the real-time weather data provided by Atmos.

CRITICAL RULES:
1. Ground all current and forecast weather details strictly in the supplied Weather Context JSON below.
2. Never invent temperature, rain probability, or wind metrics that contradict the supplied weather context.
3. Understand natural language follow-up questions using the Conversation History. If the user asks "What about running?" after "What should I wear tomorrow?", interpret "running" in the context of tomorrow's weather.
4. Keep answers concise, helpful, and natural (1-3 short paragraphs or bullet points).
5. Respect the active unit: {unit}. Output temperatures matching {unit}.
6. If asked about clothing, activities, travel, umbrellas, or outdoor plans, deliver practical recommendations based on the weather metrics.
7. If requested weather data is missing from context, state clearly that it is unavailable.

ACTIVE ATMOS WEATHER CONTEXT:
{json.dumps(weather_context, indent=2)}
"""

        reply_text = ""
        provider = "None"

        # 1. Primary Engine: Groq API with candidate model resolution
        if groq_client:
            messages = [{"role": "system", "content": system_instruction}]
            for turn in conversation[-8:]:
                role = turn.get("role", "user")
                text = turn.get("content", "")
                if text:
                    messages.append({
                        "role": "user" if role == "user" else "assistant",
                        "content": text
                    })
            messages.append({"role": "user", "content": user_message})

            groq_models = ["qwen/qwen3.8-27b", "openai/gpt-oss-20b", "llama-3.3-70b-versatile"]
            for model_name in groq_models:
                try:
                    completion = groq_client.chat.completions.create(
                        model=model_name,
                        messages=messages,
                        temperature=0.7,
                        max_tokens=800
                    )
                    reply_text = completion.choices[0].message.content
                    provider = f"Groq ({model_name})"
                    print(f"[OK] Groq generated response using {model_name}")
                    break
                except Exception as groq_err:
                    print(f"[WARN] Groq model {model_name} failed: {groq_err}")

        # 2. Secondary Engine: Gemini API
        if not reply_text and genai_client:
            try:
                from google.genai import types
                contents = []
                for turn in conversation[-8:]:
                    role = turn.get("role", "user")
                    text = turn.get("content", "")
                    if text:
                        contents.append(f"{'User' if role == 'user' else 'Atmos AI'}: {text}")
                contents.append(f"User: {user_message}")
                full_prompt = "\n".join(contents)

                response = genai_client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=full_prompt,
                    config=types.GenerateContentConfig(
                        system_instruction=system_instruction,
                        temperature=0.7,
                        max_output_tokens=800
                    )
                )
                reply_text = response.text if response else ""
                provider = "Gemini"
            except Exception as gemini_err:
                print(f"[WARN] Gemini API call failed: {gemini_err}")

        if not reply_text:
            reply_text = "I received your question, but couldn't generate a detailed response right now. Please check your API key configuration in .env."
            provider = "Offline"

        return jsonify({
            "success": True,
            "provider": provider,
            "reply": reply_text
        })

    except Exception as e:
        print(f"[ERROR] Error in /api/ai/chat: {e}")
        return jsonify({
            "success": False,
            "error": "Atmos AI couldn't respond right now. Please check your connection and backend configuration.",
            "details": str(e)
        }), 500


@app.route('/api/ai/travel', methods=['POST'])
def travel_plan():
    """Generate Travel Weather Recommendation using real meteorological data."""
    try:
        data = request.get_json() or {}
        departure = data.get("departure", {})
        destination = data.get("destination", {})
        return_trip = data.get("returnTrip", None)
        unit = data.get("unit", "Celsius (°C)")
        forecast_available = data.get("forecastAvailable", True)

        groq_client, genai_client = get_ai_clients()

        if not groq_client and not genai_client:
            return jsonify({
                "success": False,
                "error": "Atmos AI is offline. Set GROQ_API_KEY in .env.",
                "fallback": generate_offline_travel_fallback(departure, destination, forecast_available)
            }), 200

        if forecast_available:
            system_instruction = f"""You are Atmos Travel Weather Assistant.
You are given REAL meteorological forecast data fetched directly from live Open-Meteo satellites.

CRITICAL RULES:
1. Ground all recommendations strictly in the provided real weather data below.
2. DO NOT invent temperatures, rain probabilities, wind speeds, or weather conditions.
3. Respect the active unit: {unit}.
4. Provide structured, practical travel advice with bullet points covering:
   - 👕 Clothing & Layering recommendations (comparing departure vs destination temperatures)
   - ☂️ Umbrella & Rain gear necessity
   - 🏃 Outdoor Activity suitability & best times
   - ⚠️ Any significant weather hazards, wind, or humidity concerns
5. Keep recommendations concise, engaging, and directly useful to the traveler.

REAL TRAVEL WEATHER DATA:
Departure: {json.dumps(departure, indent=2)}
Destination: {json.dumps(destination, indent=2)}
Return Trip: {json.dumps(return_trip, indent=2) if return_trip else "N/A"}
"""
        else:
            system_instruction = f"""You are Atmos Travel Weather Assistant.
Notice: The selected travel date is beyond the 16-day deterministic forecast window. Detailed daily forecasts are not available yet.

CRITICAL RULES:
1. State clearly in your response that exact daily weather forecasts are not available yet for this date range (>16 days out).
2. DO NOT invent temperatures, rain probabilities, or fake daily weather values.
3. Provide helpful general seasonal planning advice for traveling from {departure.get('city', 'Departure City')} to {destination.get('city', 'Destination City')}.
4. Remind the traveler to check Atmos closer to their departure date for live satellite forecasts.
"""

        user_prompt = f"Please provide a travel weather recommendation for my trip from {departure.get('city', 'Departure')} to {destination.get('city', 'Destination')} on {departure.get('date', 'the selected date')}."

        reply_text = ""
        provider = "None"

        # 1. Primary Engine: Groq API
        if groq_client:
            messages = [
                {"role": "system", "content": system_instruction},
                {"role": "user", "content": user_prompt}
            ]
            groq_models = ["qwen/qwen3.8-27b", "openai/gpt-oss-20b", "llama-3.3-70b-versatile"]
            for model_name in groq_models:
                try:
                    completion = groq_client.chat.completions.create(
                        model=model_name,
                        messages=messages,
                        temperature=0.7,
                        max_tokens=800
                    )
                    reply_text = completion.choices[0].message.content
                    provider = f"Groq ({model_name})"
                    print(f"[OK] Groq Travel AI generated response using {model_name}")
                    break
                except Exception as groq_err:
                    print(f"[WARN] Groq model {model_name} travel failed: {groq_err}")

        # 2. Secondary Engine: Gemini API
        if not reply_text and genai_client:
            try:
                from google.genai import types
                response = genai_client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=user_prompt,
                    config=types.GenerateContentConfig(
                        system_instruction=system_instruction,
                        temperature=0.7,
                        max_output_tokens=800
                    )
                )
                reply_text = response.text if response else ""
                provider = "Gemini"
            except Exception as gemini_err:
                print(f"[WARN] Gemini Travel AI call failed: {gemini_err}")

        if not reply_text:
            reply_text = generate_offline_travel_fallback(departure, destination, forecast_available)
            provider = "Offline Fallback"

        return jsonify({
            "success": True,
            "provider": provider,
            "reply": reply_text
        })

    except Exception as e:
        print(f"[ERROR] Error in /api/ai/travel: {e}")
        return jsonify({
            "success": False,
            "error": "Travel AI could not process recommendation right now.",
            "details": str(e)
        }), 500


def generate_offline_fallback(query, weather_context):
    """Emergency rule-based fallback when no API key is configured."""
    q = query.lower()
    cur = weather_context.get("current", {})
    location = weather_context.get("location", {}).get("name", "your location")
    temp = cur.get("temperature", "--")
    unit = weather_context.get("unit", "°C")

    if "umbrella" in q or "rain" in q:
        return f"At {location}, current temperature is {temp}{unit}. Rain probability can be checked in your 24-hour forecast strip above."
    elif "wear" in q or "clothing" in q:
        return f"Currently it is {temp}{unit} in {location}. I recommend checking wind and humidity before heading out."
    elif "running" in q or "run" in q:
        return f"For outdoor activities in {location}, current temperature is {temp}{unit}. Check air quality before intense exercise."
    else:
        return f"Atmos AI is ready. (Add GROQ_API_KEY to .env for Groq AI). Current weather in {location}: {temp}{unit}, condition: {cur.get('condition', 'steady')}."


def generate_offline_travel_fallback(departure, destination, forecast_available):
    """Fallback recommendation when AI backend is unconfigured."""
    dep_city = departure.get("city", "Departure")
    dest_city = destination.get("city", "Destination")
    dep_temp = departure.get("temperature", "--")
    dest_temp = destination.get("temperature", "--")
    dest_rain = destination.get("rainProbability", "0%")

    if not forecast_available:
        return f"Detailed weather forecasts aren't available for this travel date yet. Check again closer to your departure for live satellite data."

    return f"""• 👕 **Clothing**: Expect {dest_temp} in {dest_city} compared to {dep_temp} in {dep_city}. Adjust layers accordingly.
• ☂️ **Rain Gear**: Rain probability in {dest_city} is {dest_rain}. {"Carry an umbrella or rain jacket." if "70%" in dest_rain or "50%" in dest_rain or "60%" in dest_rain else "Rain risk appears moderate to low."}
• 🏃 **Activities**: Check destination humidity ({destination.get('humidity', '--')}) and wind before planning extended outdoor excursions."""


if __name__ == '__main__':
    config = dotenv_values(ENV_PATH)
    port = int(config.get("PORT") or os.getenv("PORT") or 5005)
    print(f"[SERVER] Starting Atmos AI Flask Backend on http://127.0.0.1:{port}")
    app.run(host='0.0.0.0', port=port, debug=False)
