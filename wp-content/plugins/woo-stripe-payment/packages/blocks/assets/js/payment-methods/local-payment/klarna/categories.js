import {useEffect} from '@wordpress/element';
import RadioControlAccordion from "../../../components/checkout/radio-control-accordion";

export const KlarnaPaymentCategories = ({categories, onChange, selected}) => {
    return (
        <div className={'wc-stripe-blocks-klarna-container'}>
            <ul>
                {categories.map(category => {
                    return <KlarnaPaymentCategory
                        key={category.type}
                        category={category}
                        onChange={onChange}
                        selected={selected}/>
                })}
            </ul>
        </div>
    );
}

const KlarnaPaymentCategory = ({category, selected, onChange}) => {
    const checked = category.type === selected;
    useEffect(() => {
        Klarna.Payments.load({
            container: `#klarna-category-${category.type}`,
            payment_method_category: category.type,
            //instance_id: `klarna-instance-${category.type}`
        });
    }, []);
    const option = {
        label: category.label,
        value: category.type,
        content: (<div id={`klarna-category-${category.type}`}></div>)
    }
    return (
        <li className='wc-stripe-blocks-klarna__category' key={category.type}>
            <RadioControlAccordion option={option} checked={checked} onChange={onChange}/>
        </li>
    )
}