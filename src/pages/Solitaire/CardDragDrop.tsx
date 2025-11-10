import { useDraggable, useDroppable } from "@dnd-kit/core"
import type { ICard } from "../../data/solitaire";

export const CardDragDrop = (props: any) => {
    const {attributes, listeners, setNodeRef: setDraggableRef} = useDraggable({
        id: props.id
    });
    const {isOver, setNodeRef: setDroppableRef} = useDroppable({
        id: props.id
    })

    const setNodeRef = (node: HTMLElement|null) => {
        setDraggableRef(node);
        setDroppableRef(props.isDropDisabled ? null : node);
    };

    return (
        <div
            ref={setNodeRef}
            {...attributes}
            {...listeners}
            style={props.style}
            className={props.className}
            
        >
            {props.children}
        </div>
    )
}