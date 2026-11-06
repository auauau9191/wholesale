import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import PipelineCard from "@/components/console/pipeline/PipelineCard";
import { STAGE_LABEL, STAGES } from "@/lib/supplier-rules";

const COLUMN = "w-[232px] shrink-0 rounded-card border border-edge bg-sheet p-2 lg:w-auto lg:shrink";

/** Six columns plus Rejected. Dropping a card anywhere is a stage move. */
export default function PipelineBoard({ rows, showRejected, onMove }) {
  const stages = showRejected ? [...STAGES, "rejected"] : STAGES;

  return (
    <DragDropContext
      onDragEnd={(result) => {
        if (!result.destination) return;
        onMove(result.draggableId, result.destination.droppableId);
      }}
    >
      <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2 lg:mx-0 lg:grid lg:grid-cols-6 lg:overflow-visible lg:px-0">
        {stages.map((stage) => {
          const cards = rows.filter((row) => row.pipeline_stage === stage);
          return (
            <Droppable droppableId={stage} key={stage}>
              {(provided, snapshot) => (
                <section
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`${COLUMN} ${snapshot.isDraggingOver ? "border-data" : ""}`}
                >
                  <h2 className="flex items-baseline justify-between px-1 pb-2 text-body font-medium">
                    {STAGE_LABEL[stage]}
                    <span className="tabular text-label text-app-meta">{cards.length}</span>
                  </h2>
                  <div className="space-y-2">
                    {cards.map((row, index) => (
                      <Draggable draggableId={row.id} index={index} key={row.id}>
                        {(drag, state) => (
                          <div ref={drag.innerRef} {...drag.draggableProps} {...drag.dragHandleProps}>
                            <PipelineCard row={row} dragging={state.isDragging} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    {!cards.length ? <p className="px-1 pb-2 text-label text-app-meta">Nothing here.</p> : null}
                  </div>
                </section>
              )}
            </Droppable>
          );
        })}
      </div>
    </DragDropContext>
  );
}