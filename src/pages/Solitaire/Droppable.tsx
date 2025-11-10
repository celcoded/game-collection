import { useDroppable } from "@dnd-kit/core"

export const Droppable = (props: any) => {
    const {setNodeRef} = useDroppable({
        id: props.id
    });

    return (
        <div ref={setNodeRef} className={props.className}>
            {props.children}
        </div>
    )
}