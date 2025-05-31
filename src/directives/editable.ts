import type {ObjectDirective, DirectiveBinding} from 'vue';
import {isRef, type Ref} from 'vue';

// Payload must include value and an update callback to avoid automatic ref unwrapping
interface EditablePayload extends HTMLElement{
    value: string | Ref<string>;
    onUpdate: (val: string) => void;
}

const contenteditable: ObjectDirective<EditablePayload> = {
    mounted(el: HTMLElement, binding: DirectiveBinding<EditablePayload>) {
        const isEditableUsage = binding.arg === undefined;
        if (!isEditableUsage) return;

        const {value: raw, onUpdate} = binding.value;
        const defaultText = binding.modifiers.default ? 'Untitled' : '';

        // READ from raw value or ref
        const getModel = (): string => {
            if (isRef(raw)) return raw.value || defaultText;
            return raw ?? defaultText;
        };

        const setModel = (val: string) => {
            onUpdate(val);
        };

        let original = getModel();
        let draft = original;

        el.contentEditable = 'true';
        el.innerText = original || defaultText;
        const applyModifiers = (text: string): string => {
            if (binding.modifiers.trim) text = text.trim();
            if (binding.modifiers.uppercase) text = text.toUpperCase();
            if (binding.modifiers.lowercase) text = text.toLowerCase();
            return text;
        };

        /*function setStyling(set:boolean){
            if(set){
                el.classList.add("block w-full border-b-0 transition-[border-bottom-width,color] duration-200 ease-in-out" +
                    " focus:outline-none focus:ring-0 focus:border-b-2 focus:border-muted-foreground" +
                    " empty:before:content-['Untitled'] empty:before:text-muted-foreground empty:before:italic" +
                    " empty:before:pointer-events-none")
            }else{
                el.classList = defaultClasses.reduce((acc,next)=>acc+' '+next)
            }
        }*/
        el.addEventListener('focus', () => {
            draft = el.innerText;
        });

        el.addEventListener('input', (e) => {
            draft = (e.target as HTMLElement).innerText;
        });

        el.addEventListener('keydown', (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                el.blur();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                el.innerText = original || defaultText;
                el.blur();
            }
        });

        el.addEventListener('blur', () => {
            let processed = applyModifiers(draft || '');
            if (!processed && defaultText) {
                processed = defaultText;
                el.innerText = defaultText;
            }
            setModel(processed);
            original = processed;
        });
    },

    updated(el: HTMLElement, binding: DirectiveBinding<EditablePayload>) {
        const isEditableUsage = binding.arg === undefined;
        if (!isEditableUsage) return;

        const {value: raw} = binding.value;
        const defaultText = binding.modifiers.default ? 'Untitled' : '';

        const newValue = isRef(raw) ? raw.value : raw;
        const text = newValue ?? defaultText;
        if (el.innerText !== text) {
            el.innerText = text;
        }
    }
};

export default contenteditable;
