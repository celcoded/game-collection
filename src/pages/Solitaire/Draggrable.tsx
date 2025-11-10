import { useDraggable } from "@dnd-kit/core"

export const Draggable = (props: any) => {
    const {attributes, listeners, setNodeRef, transform} = useDraggable({
        id: props.id
    });

    const style = transform ? {
        ...props.style,
        pointerEvents: 'none',
        // touchAction: 'none'
        // transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        // zIndex: '999',
        // position: 'fixed',
    } : props.style;

    return (
        <div ref={setNodeRef} style={style} className={props.className} {...listeners} {...attributes}>
            {props.children}
        </div>
    )
}