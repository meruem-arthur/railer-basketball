"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Label, Input, Textarea, Select, FieldError } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { ImageUploader } from "@/components/admin/image-uploader";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import type { NewsFormState } from "@/app/admin/(dashboard)/news/actions";
import type { NewsArticle, NewsCategory } from "@prisma/client";

const CATEGORY_LABELS: Record<string, string> = {
  TEAM_NEWS: "Team News",
  MATCH_REPORT: "Match Report",
  TRAINING: "Training",
  TOURNAMENT: "Tournament",
  PLAYER_NEWS: "Player News",
  ANNOUNCEMENT: "Announcement",
};

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving…" : label}
    </Button>
  );
}

export function NewsForm({
  article,
  categories,
  action,
  mode,
}: {
  article?: NewsArticle;
  categories: NewsCategory[];
  action: (prev: NewsFormState, formData: FormData) => Promise<NewsFormState>;
  mode: "create" | "edit";
}) {
  const router = useRouter();
  const [state, formAction] = useActionState(action, { success: false });
  const handledRef = useRef(false);
  const [content, setContent] = useState(article?.content ?? "");
  const [image, setImage] = useState<{ secureUrl: string; publicId: string } | null>(
    article?.featuredImageUrl && article.featuredImagePublicId
      ? { secureUrl: article.featuredImageUrl, publicId: article.featuredImagePublicId }
      : null
  );

  useEffect(() => {
    if (!state.success || handledRef.current) return;
    handledRef.current = true;
    if (mode === "create" && state.articleId) {
      toast.success("Article created.");
      router.push(`/admin/news/${state.articleId}`);
    } else if (mode === "edit") {
      toast.success("Article saved.");
    }
  }, [state, mode, router]);

  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-6 max-w-3xl">
      {state.error && (
        <p role="alert" className="text-sm text-rail-loss">
          {state.error}
        </p>
      )}

      <div>
        <Label htmlFor="title" required>Title</Label>
        <Input id="title" name="title" defaultValue={article?.title} hasError={!!errors.title} />
        <FieldError message={errors.title} />
      </div>

      <div>
        <Label htmlFor="excerpt" required>Excerpt</Label>
        <Textarea id="excerpt" name="excerpt" rows={2} defaultValue={article?.excerpt} hasError={!!errors.excerpt} />
        <FieldError message={errors.excerpt} />
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <Label htmlFor="categoryName" required>Category</Label>
          <Select id="categoryName" name="categoryName" defaultValue={categories.find((c) => c.id === article?.categoryId)?.name ?? ""}>
            <option value="" disabled>Select category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {CATEGORY_LABELS[c.name] ?? c.label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select id="status" name="status" defaultValue={article?.status ?? "DRAFT"}>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="featuredImage">Featured image</Label>
        <ImageUploader folder="news" initialUrl={image?.secureUrl} onUploaded={setImage} label="Upload cover" />
        <input type="hidden" name="featuredImageUrl" value={image?.secureUrl ?? ""} />
        <input type="hidden" name="featuredImagePublicId" value={image?.publicId ?? ""} />
      </div>

      <div>
        <Label htmlFor="content" required>Content</Label>
        <RichTextEditor value={content} onChange={setContent} />
        <input type="hidden" name="content" value={content} />
        <FieldError message={errors.content} />
      </div>

      <SubmitButton label={mode === "create" ? "Create article" : "Save changes"} />
    </form>
  );
}
