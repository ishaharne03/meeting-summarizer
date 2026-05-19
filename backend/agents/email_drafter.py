from crewai import Agent, Task, Crew
from dotenv import load_dotenv
import json
import re

load_dotenv()

def run_email_drafter(action_items: list) -> dict:
    if not action_items:
        return {
            "subject": "Meeting Summary",
            "body": "Please find the meeting summary attached. No action items were identified."
        }

    items_text = "\n".join([
        f"- {item.get('text', '')} (Assignee: {item.get('assignee', 'Unassigned')})"
        for item in action_items
    ])

    drafter_agent = Agent(
        role="Executive Assistant",
        goal="Write clear, professional follow-up emails summarizing meeting action items",
        backstory="""You are a highly skilled executive assistant known for writing 
        concise, professional emails that busy professionals actually read. 
        Your emails are friendly but direct, always under 200 words.""",
        verbose=False,
        allow_delegation=False,
        llm="gpt-4o-mini"
    )

    drafting_task = Task(
        description=f"""Write a professional follow-up email for a meeting with these action items:

        {items_text}

        Requirements:
        - Subject line should be concise and specific
        - Body should be friendly but professional
        - List each action item clearly with the assignee
        - End with a call to action
        - Keep it under 200 words
        - Do NOT use markdown formatting like **bold** — plain text only

        You MUST respond with ONLY a valid JSON object in exactly this format:
        {{
            "subject": "your subject line here",
            "body": "your full email body here"
        }}

        Do not include any explanation or text outside the JSON.""",
        expected_output="A valid JSON object with subject and body fields",
        agent=drafter_agent
    )

    crew = Crew(
        agents=[drafter_agent],
        tasks=[drafting_task],
        verbose=False
    )

    result = crew.kickoff()
    raw = str(result)

    try:
        json_match = re.search(r'\{.*\}', raw, re.DOTALL)
        if json_match:
            return json.loads(json_match.group())
    except json.JSONDecodeError:
        pass

    return {
        "subject": "Meeting Follow-up",
        "body": f"Please find below the action items from our meeting:\n\n{items_text}"
    }