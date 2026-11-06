import PageHead from "@/components/shell/PageHead";
import DataBlock from "@/components/shell/DataBlock";
import { HUB_LABEL, useHubScope } from "@/components/shell/HubScope";

/** A placeholder member screen: its title, one grey sentence, one empty block. */
export default function MemberPage({ title, note, emptyTitle, emptyNote }) {
  return (
    <div className="space-y-7">
      <PageHead title={title} note={note} />
      <DataBlock title={emptyTitle} note={emptyNote} />
    </div>
  );
}

/** The same shape for the console, with the hub scope in its sentence. */
export function ConsolePage({ title, note, emptyTitle, emptyNote, scoped = false }) {
  const { hub } = useHubScope();
  const sentence = scoped ? `${note} ${HUB_LABEL[hub]}.` : note;

  return (
    <div className="space-y-7">
      <PageHead title={title} note={sentence} />
      <DataBlock title={emptyTitle} note={emptyNote} />
    </div>
  );
}