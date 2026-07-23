import Anthropic from "@anthropic-ai/sdk";

export const anthropic = new Anthropic();

export async function generateSubtasks(
  title: string,
  description?: string | null
): Promise<string[]> {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: [
          `Break this task down into 3-6 smaller, concrete, immediately actionable subtasks.`,
          `Task: "${title}"`,
          description ? `Additional context: ${description}` : null,
          `Each subtask should be small enough to start without further thought.`,
        ]
          .filter(Boolean)
          .join("\n"),
      },
    ],
    output_config: {
      format: {
        type: "json_schema",
        schema: {
          type: "object",
          properties: {
            subtasks: {
              type: "array",
              items: { type: "string" },
            },
          },
          required: ["subtasks"],
          additionalProperties: false,
        },
      },
    },
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") return [];

  const parsed = JSON.parse(textBlock.text) as { subtasks: string[] };
  return parsed.subtasks;
}
